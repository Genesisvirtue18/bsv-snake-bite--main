'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Award, CheckCircle2, XCircle, Sparkles, Download, RefreshCw, Trophy, BookOpen, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const BRAND = { blue: '#151f6d', red: '#de2527', white: '#ffffff' }

export default function QuizSection({ t, lang }) {
  const [questions, setQuestions] = useState([])
  const [phase, setPhase] = useState('intro') // intro | playing | done
  const [info, setInfo] = useState({ name: '', email: '', state: '' })
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [picked, setPicked] = useState(null)
  const [reveal, setReveal] = useState(false)
  const [score, setScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch('/api/quiz/questions').then(r => r.ok ? r.json() : []).then(d => {
      const published = (d || []).filter(q => q.published !== false)
      setQuestions(published)
    }).catch(() => {})
  }, [])

  if (!questions.length) return null

  const pct = phase === 'playing' ? Math.round(((idx) / questions.length) * 100) : 0
  const passing = Math.ceil(questions.length * 0.6)

  const startQuiz = () => {
    if (!info.name?.trim()) { toast.error('Please enter your name'); return }
    setPhase('playing')
    setIdx(0); setAnswers({}); setPicked(null); setReveal(false); setScore(0); setResult(null)
  }

  const pickAnswer = (i) => {
    if (reveal) return
    setPicked(i)
    setReveal(true)
    const q = questions[idx]
    const correct = i === q.correctIndex
    if (correct) setScore(s => s + 1)
    setAnswers(a => ({ ...a, [q.id]: { picked: i, correct } }))
  }

  const nextQuestion = async () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1); setPicked(null); setReveal(false)
    } else {
      // Submit
      setSubmitting(true)
      const total = questions.length
      const passed = score >= passing
      try {
        const r = await fetch('/api/quiz/submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...info, score, total, passed, language: lang || 'en' })
        })
        const data = await r.json()
        setResult({ score, total, passed, certificateNumber: data.certificateNumber, name: info.name, date: new Date() })
        setPhase('done')
      } catch { toast.error('Submission failed') }
      setSubmitting(false)
    }
  }

  const restart = () => { setPhase('intro'); setIdx(0); setScore(0); setAnswers({}); setPicked(null); setReveal(false); setResult(null) }

  const downloadCertificate = async () => {
    if (!result) return
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297, H = 210

      // Outer border
      doc.setDrawColor(21, 31, 109); doc.setLineWidth(2)
      doc.rect(8, 8, W - 16, H - 16)
      // Inner border (red)
      doc.setDrawColor(222, 37, 39); doc.setLineWidth(0.8)
      doc.rect(12, 12, W - 24, H - 24)

      // Decorative corners
      doc.setFillColor(21, 31, 109)
      doc.circle(12, 12, 2.5, 'F'); doc.circle(W - 12, 12, 2.5, 'F'); doc.circle(12, H - 12, 2.5, 'F'); doc.circle(W - 12, H - 12, 2.5, 'F')

      // Header bar
      doc.setFillColor(21, 31, 109)
      doc.rect(12, 12, W - 24, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold').setFontSize(20)
      doc.text('BSV SNAKEBITE AWARENESS CAMPAIGN', W / 2, 22, { align: 'center' })
      doc.setFont('helvetica', 'normal').setFontSize(10)
      doc.text("Saap Ka Vaar, Aspataal Mein Hi Upchaar", W / 2, 29, { align: 'center' })

      // Title
      doc.setTextColor(222, 37, 39)
      doc.setFont('helvetica', 'bold').setFontSize(36)
      doc.text('CERTIFICATE OF AWARENESS', W / 2, 58, { align: 'center' })

      // Subtitle
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal').setFontSize(11)
      doc.text('This certificate is proudly presented to', W / 2, 72, { align: 'center' })

      // Name (large)
      doc.setTextColor(21, 31, 109)
      doc.setFont('helvetica', 'bold').setFontSize(34)
      doc.text(result.name || 'Participant', W / 2, 92, { align: 'center' })

      // Underline name
      doc.setDrawColor(222, 37, 39); doc.setLineWidth(0.6)
      doc.line(W / 2 - 60, 96, W / 2 + 60, 96)

      // Body text
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal').setFontSize(11)
      const passedText = result.passed
        ? `for successfully completing the BSV Snakebite Awareness Quiz with a score of ${result.score}/${result.total}.`
        : `for participating in the BSV Snakebite Awareness Quiz with a score of ${result.score}/${result.total}.`
      const lines = doc.splitTextToSize(passedText, 200)
      doc.text(lines, W / 2, 108, { align: 'center' })

      doc.setFontSize(10).setFont('helvetica', 'italic')
      doc.text("Saving lives across India, one informed citizen at a time.", W / 2, 124, { align: 'center' })

      // Score box
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(W / 2 - 40, 132, 80, 26, 3, 3, 'F')
      doc.setTextColor(21, 31, 109)
      doc.setFont('helvetica', 'bold').setFontSize(11)
      doc.text('FINAL SCORE', W / 2, 140, { align: 'center' })
      doc.setFont('helvetica', 'bold').setFontSize(20)
      doc.setTextColor(222, 37, 39)
      doc.text(`${result.score} / ${result.total}`, W / 2, 152, { align: 'center' })

      // Footer
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal').setFontSize(9)
      const dateStr = new Date(result.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      doc.text(`Date of Issue: ${dateStr}`, 30, H - 30)
      doc.text(`Certificate No: ${result.certificateNumber || 'BSV-' + Date.now()}`, W - 30, H - 30, { align: 'right' })

      // Signature line
      doc.setDrawColor(21, 31, 109); doc.setLineWidth(0.4)
      doc.line(W / 2 - 30, H - 24, W / 2 + 30, H - 24)
      doc.setFont('helvetica', 'bold').setFontSize(9)
      doc.setTextColor(21, 31, 109)
      doc.text('Bharat Serums and Vaccines Ltd.', W / 2, H - 19, { align: 'center' })

      doc.save(`BSV-Snakebite-Certificate-${result.name.replace(/\s+/g, '_')}.pdf`)
      toast.success('Certificate downloaded!')
    } catch (e) {
      console.error(e)
      toast.error('PDF generation failed')
    }
  }

  return (
    <section id="quiz" className="section-pad" style={{ background: `linear-gradient(135deg, ${BRAND.blue}05, ${BRAND.red}08)` }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3" style={{ color: BRAND.red, borderColor: BRAND.red }}>{t.badges.quiz}</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-3" style={{ color: BRAND.blue }}>{t.quiz.title}</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">{t.quiz.subtitle}</p>
        </div>

        <Card className="border-0 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.red})` }}>
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-xl" style={{ color: BRAND.blue }}>{questions.length} questions</div>
                      <div className="text-sm text-slate-600">~ 3-5 minutes • Multiple choice • Instant feedback</div>
                    </div>
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed">
                    Test your knowledge of snakebite Do&apos;s and Don&apos;ts. Score <strong>{passing}/{questions.length}</strong> or more to earn your <strong>BSV Awareness Certificate</strong> with your name on it.
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 mb-6">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-slate-500">Your Name *</Label>
                      <Input value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder="As shown on certificate" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-slate-500">Email (optional)</Label>
                      <Input type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} placeholder="you@example.com" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-slate-500">State (optional)</Label>
                      <Input value={info.state} onChange={e => setInfo({ ...info, state: e.target.value })} placeholder="Your state" />
                    </div>
                  </div>
                  <Button onClick={startQuiz} size="lg" className="text-white shadow-lg" style={{ background: BRAND.red }}>
                    <Sparkles className="w-4 h-4 mr-2" /> {t.quiz.start}
                  </Button>
                </div>
              </motion.div>
            )}

            {phase === 'playing' && (
              <motion.div key={`q-${idx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                {/* Progress bar */}
                <div className="h-1.5 bg-slate-100">
                  <motion.div className="h-full" style={{ background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.red})` }} initial={{ width: `${pct}%` }} animate={{ width: `${Math.round(((idx + 1) / questions.length) * 100)}%` }} transition={{ duration: 0.4 }} />
                </div>
                <div className="p-6 md:p-10">
                  <div className="flex items-center justify-between mb-5 text-sm">
                    <span className="font-semibold uppercase tracking-wider" style={{ color: BRAND.red }}>Question {idx + 1} of {questions.length}</span>
                    <span className="text-slate-500">Score: <strong style={{ color: BRAND.blue }}>{score}</strong></span>
                  </div>
                  <h3 className="font-display font-semibold text-xl md:text-2xl mb-6 leading-tight" style={{ color: BRAND.blue }}>{questions[idx].question}</h3>
                  <div className="space-y-3 mb-6">
                    {questions[idx].options.map((opt, i) => {
                      const isCorrect = i === questions[idx].correctIndex
                      const isPicked = picked === i
                      let state = 'idle'
                      if (reveal) {
                        if (isCorrect) state = 'correct'
                        else if (isPicked) state = 'wrong'
                        else state = 'muted'
                      } else if (isPicked) state = 'picked'

                      const styles = {
                        idle: 'border-slate-200 hover:border-[#151f6d] hover:bg-slate-50',
                        picked: 'border-[#151f6d] bg-blue-50 ring-2 ring-[#151f6d]/30',
                        correct: 'border-green-600 bg-green-50',
                        wrong: 'border-red-600 bg-red-50',
                        muted: 'border-slate-200 opacity-60',
                      }
                      return (
                        <motion.button
                          key={i}
                          whileHover={!reveal ? { scale: 1.01 } : {}}
                          whileTap={!reveal ? { scale: 0.99 } : {}}
                          onClick={() => pickAnswer(i)}
                          disabled={reveal}
                          className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-3 ${styles[state]}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${state === 'correct' ? 'bg-green-600 text-white' : state === 'wrong' ? 'bg-red-600 text-white' : state === 'picked' ? 'bg-[#151f6d] text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {state === 'correct' ? <CheckCircle2 className="w-4 h-4" /> : state === 'wrong' ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                          </div>
                          <span className="flex-1 text-sm md:text-base">{opt}</span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {reveal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-4 rounded-xl border-l-4 ${answers[questions[idx].id]?.correct ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'} mb-4`}>
                          <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                            {answers[questions[idx].id]?.correct ? <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-green-700">Correct!</span></> : <><XCircle className="w-4 h-4 text-red-600" /><span className="text-red-700">Not quite</span></>}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{questions[idx].explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {reveal && (
                    <Button onClick={nextQuestion} disabled={submitting} size="lg" className="text-white w-full md:w-auto" style={{ background: BRAND.red }}>
                      {idx < questions.length - 1 ? <>{t.quiz.next} <ChevronRight className="w-4 h-4 ml-1" /></> : <>{submitting ? 'Submitting...' : t.quiz.submit} <Trophy className="w-4 h-4 ml-1" /></>}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {phase === 'done' && result && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <div className="p-8 md:p-12 text-center">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: 'spring' }} className="mb-6 inline-flex">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl" style={{ background: result.passed ? `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.red})` : '#94a3b8' }}>
                      {result.passed ? <Trophy className="w-14 h-14 text-white" /> : <Award className="w-14 h-14 text-white" />}
                    </div>
                  </motion.div>
                  <h3 className="font-display text-3xl md:text-4xl font-semibold mb-2" style={{ color: BRAND.blue }}>
                    {result.passed ? 'Congratulations!' : 'Good Effort!'}
                  </h3>
                  <p className="text-slate-600 mb-6">{result.passed ? "You've earned your BSV Awareness Certificate." : 'Keep learning and try again to earn the certificate.'}</p>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
                    <div className="rounded-xl p-4 text-white shadow-lg" style={{ background: BRAND.blue }}>
                      <div className="font-display text-3xl font-semibold">{result.score}</div>
                      <div className="text-[10px] uppercase tracking-wider opacity-90">Correct</div>
                    </div>
                    <div className="rounded-xl p-4 text-white shadow-lg" style={{ background: BRAND.red }}>
                      <div className="font-display text-3xl font-semibold">{result.total}</div>
                      <div className="text-[10px] uppercase tracking-wider opacity-90">Total</div>
                    </div>
                    <div className="rounded-xl p-4 text-white shadow-lg" style={{ background: result.passed ? '#16a34a' : '#94a3b8' }}>
                      <div className="font-display text-3xl font-semibold">{Math.round((result.score / result.total) * 100)}%</div>
                      <div className="text-[10px] uppercase tracking-wider opacity-90">Score</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={downloadCertificate} disabled={!result.passed} size="lg" className="text-white" style={{ background: BRAND.red }}>
                      <Download className="w-4 h-4 mr-2" /> {t.quiz.certificate}
                    </Button>
                    <Button onClick={restart} variant="outline" size="lg">
                      <RefreshCw className="w-4 h-4 mr-2" /> Take Again
                    </Button>
                  </div>
                  {result.certificateNumber && <div className="text-xs text-slate-500 mt-4">Certificate ID: <span className="font-mono">{result.certificateNumber}</span></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  )
}
