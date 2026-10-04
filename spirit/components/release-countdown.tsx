'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Original rounded orbital numerals, drawn for this countdown.
const orbitalDigits:Record<string,string>={
 '0':'M34 8 C16 8 8 20 8 40 C8 60 16 72 34 72 C52 72 60 60 60 40 C60 20 52 8 34 8 Z',
 '1':'M15 24 L34 8 L34 72 M17 72 H53',
 '2':'M9 23 C10 13 19 8 34 8 C50 8 59 14 59 25 C59 35 50 41 37 45 L20 51 C12 54 8 60 8 72 H60',
 '3':'M9 8 H40 C53 8 59 14 59 24 C59 34 52 40 39 40 H28 M39 40 C53 40 60 46 60 56 C60 67 52 72 39 72 H9',
 '4':'M43 8 L9 46 Q7 50 13 50 H60 M47 28 V72',
 '5':'M59 8 H12 V36 H38 C52 36 60 43 60 54 C60 66 51 72 37 72 H9',
 '6':'M56 8 H34 C16 8 8 19 8 40 V52 C8 65 18 72 34 72 C50 72 60 65 60 52 C60 39 50 34 35 34 H23',
 '7':'M8 8 H60 L24 72',
 '8':'M34 8 C18 8 10 14 10 24 C10 34 18 40 34 40 C50 40 58 34 58 24 C58 14 50 8 34 8 Z M34 40 C17 40 8 46 8 56 C8 67 17 72 34 72 C51 72 60 67 60 56 C60 46 51 40 34 40 Z',
 '9':'M12 72 H34 C52 72 60 61 60 40 V28 C60 15 50 8 34 8 C18 8 8 15 8 28 C8 41 18 46 33 46 H45',
 '—':'M12 40 H56',
};
function ClockNumber({value,reduce}:{value:string;reduce:boolean|null}) {
 return <span className="orbital-number" role="img" aria-label={value}>{value.split('').map((digit,index)=><svg key={index} className="orbital-digit" viewBox="0 0 68 80" aria-hidden="true"><motion.path key={digit} d={orbitalDigits[digit]} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" initial={reduce?false:{opacity:0}} animate={{opacity:1}} transition={{duration:reduce?0:.38,ease:'easeOut'}}/></svg>)}</span>;
}
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
 return <motion.div className="release-clock" aria-label="Countdown to March 5, 2027, midnight India Standard Time" initial={reduce?false:{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.4}} transition={{duration:1,ease:[.22,1,.36,1]}}>
  <div className="countdown-units">{['Days', 'Hours', 'Minutes', 'Seconds'].map((label, index) => <div className="countdown-unit" key={label}>{index > 0 && <span className="clock-colon" aria-hidden="true"><i/><i/></span>}
   <div className="countdown-number"><ClockNumber value={time ? String(time[index]).padStart(2,'0') : '——'} reduce={reduce}/></div>
   <span className="countdown-label">{label}</span>
  </div>)}</div>
  <div className="countdown-footer"><span className="countdown-beacon" aria-hidden="true"/><span>{arrived ? 'THE ANNOUNCED RELEASE DATE HAS ARRIVED' : 'EVERY SECOND BRINGS US CLOSER'}</span><span className="countdown-zone">MIDNIGHT · IST</span></div>
 </motion.div>;
}
