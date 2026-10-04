'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const segments=['8,3 40,3 44,7 40,11 8,11 4,7','43,10 47,14 47,40 43,44 39,40 39,14','43,48 47,52 47,78 43,82 39,78 39,52','8,81 40,81 44,85 40,89 8,89 4,85','5,48 9,52 9,78 5,82 1,78 1,52','5,10 9,14 9,40 5,44 1,40 1,14','8,42 40,42 44,46 40,50 8,50 4,46'];
const digitSegments:Record<string,string>={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg','5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg','—':'g'};
function ClockNumber({value,reduce}:{value:string;reduce:boolean|null}) {
 return <span className="segment-number" role="img" aria-label={value}>{value.split('').map((digit,index)=><svg key={index} className="segment-digit" viewBox="0 0 48 92" aria-hidden="true">{segments.map((points,s)=><motion.polygon key={s} points={points} fill="currentColor" initial={false} animate={{opacity:digitSegments[digit].includes('abcdefg'[s])?1:.045}} transition={{duration:reduce?0:.28,ease:'easeOut'}}/>)}</svg>)}</span>;
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
