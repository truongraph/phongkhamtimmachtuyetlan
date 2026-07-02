import {
  HeartPulse, Activity, ShieldCheck, Stethoscope, Baby, Waves, Radio, LineChart,
  Search, HandCoins, Award, GraduationCap, Clock, MapPin, Phone, Building2,
  Heart, Radar, CircleCheckBig, Syringe, type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  heart: HeartPulse,
  activity: Activity,
  shield: ShieldCheck,
  stethoscope: Stethoscope,
  baby: Baby,
  vessel: Waves,
  ecg: Radio,
  pulse: LineChart,
  search: Search,
  coins: HandCoins,
  award: Award,
  cap: GraduationCap,
  clock: Clock,
  pin: MapPin,
  phone: Phone,
  building: Building2,
  scanheart: Radar,
  check: CircleCheckBig,
  syringe: Syringe,
  love: Heart,
}

export const ICON_OPTIONS = Object.keys(ICONS)

export function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Cmp = ICONS[name] ?? HeartPulse
  return <Cmp className={className} style={style} />
}
