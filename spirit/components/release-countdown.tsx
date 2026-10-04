'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Countdown to the announced release date, midnight in India (not a showtime).
const releaseAt = Date.parse('2027-03-05T00:00:00+05:30');
export function remainingTime(now: number) {
 const seconds = Math.max(0, Math.floor((releaseAt - now) / 1000));
 return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}
export default function ReleaseCountdown() {
 const [time, setTime] = useState<number[] | null>(null);
 const reduce = useReducedMotion();
 useEffect(() => {
  const update = () => setTime(remainingTime(Date.now()));
  update();
  const timer = window.setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
  return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', update); };
 }, []);
 const arrived = time?.every(value => value === 0);
 return <div className="release-clock" aria-label="Countdown to March 5, 2027, midnight India Standard Time">
  <div className="countdown-units">{['Days', 'Hours', 'Minutes', 'Seconds'].map((label, index) => <div className="countdown-unit" key={label}>{index > 0 && <span className="clock-colon" aria-hidden="true"><i/><i/></span>}
   <div className="countdown-number"><AnimatePresence initial={false} mode="popLayout"><motion.span key={time?.[index] ?? 'loading'} initial={reduce ? false : { y: '70%', opacity: 0, rotateX: -55, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)' }} exit={reduce ? { opacity: 0 } : { y: '-65%', opacity: 0, rotateX: 55, filter: 'blur(3px)' }} transition={{ duration: reduce ? 0 : .55, ease: [.22, 1, .36, 1] }}>{time ? String(time[index]).padStart(2, '0') : '—'}</motion.span></AnimatePresence></div>
   <span className="countdown-label">{label}</span>
  </div>)}</div>
  <div className="countdown-footer"><span className="countdown-beacon" aria-hidden="true"/><span>{arrived ? 'THE ANNOUNCED RELEASE DATE HAS ARRIVED' : 'EVERY SECOND BRINGS US CLOSER'}</span><span className="countdown-zone">MIDNIGHT · IST</span></div>
 </div>;
}
