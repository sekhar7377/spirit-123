'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const glyphs: Record<string,string[]> = {
 '0':['01110','11011','11011','11011','11011','11011','01110'],
 '1':['00100','01100','00100','00100','00100','00100','01110'],
 '2':['01110','10001','00001','00010','00100','01000','11111'],
 '3':['11110','00001','00001','01110','00001','00001','11110'],
 '4':['00010','00110','01010','10010','11111','00010','00010'],
 '5':['11111','10000','10000','11110','00001','00001','11110'],
 '6':['01110','10000','10000','11110','10001','10001','01110'],
 '7':['11111','00001','00010','00100','01000','01000','01000'],
 '8':['01110','10001','10001','01110','10001','10001','01110'],
 '9':['01110','10001','10001','01111','00001','00001','01110'],
 '—':['00000','00000','00000','11111','00000','00000','00000'],
};
function MatrixNumber({value,reduce}:{value:string;reduce:boolean|null}) {
 return <span className="matrix-number" role="img" aria-label={value}>{value.split('').map((digit,index)=><svg key={index} viewBox="0 0 50 70" aria-hidden="true" className="matrix-digit">
  {glyphs[digit].flatMap((row,y)=>row.split('').map((lit,x)=><circle key={`base-${y}-${x}`} cx={5+x*10} cy={5+y*10} r="2.8" fill="#e4edf4" opacity={lit==='1'?.07:.025}/>))}
  <motion.g key={digit} initial={reduce?false:{opacity:0,y:3}} animate={{opacity:1,y:0}} transition={{duration:.38,ease:[.22,1,.36,1]}}>{glyphs[digit].flatMap((row,y)=>row.split('').map((lit,x)=>lit==='1'?<motion.circle key={`${y}-${x}`} cx={5+x*10} cy={5+y*10} r="2.8" fill="currentColor" initial={reduce?false:{opacity:0}} animate={{opacity:1}} transition={{duration:.18,delay:reduce?0:y*.025+x*.009}}/>:null))}</motion.g>
 </svg>)}</span>;
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
   <div className="countdown-number"><MatrixNumber value={time ? String(time[index]).padStart(2,'0') : '——'} reduce={reduce}/></div>
   <span className="countdown-label">{label}</span>
  </div>)}</div>
  <div className="countdown-footer"><span className="countdown-beacon" aria-hidden="true"/><span>{arrived ? 'THE ANNOUNCED RELEASE DATE HAS ARRIVED' : 'EVERY SECOND BRINGS US CLOSER'}</span><span className="countdown-zone">MIDNIGHT · IST</span></div>
 </motion.div>;
}
