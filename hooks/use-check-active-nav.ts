import { usePathname } from 'next/navigation'

export default function useCheckActiveNav() {
  const pathname = usePathname()

  const checkActiveNav = (nav: string) => {
    const pathArray = pathname.split('/').filter((item) => item !== '')

    if (nav === '/' && pathArray.length === 0) return true

    return pathArray.includes(nav.replace(/^\//, ''))
  }

  return { checkActiveNav }
}
