import type {Metadata} from 'next';
import './globals.css';
import './live.css';
export const metadata:Metadata={title:'ValoTribe | Find the tribe that matches your vibe',description:'Opt-in VALORANT teammate discovery. Find the tribe that matches your vibe.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
