import { Coins, SearchIcon } from "lucide-react"
import Link from "next/link"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

export default function Header() {
  return <header className="flex justify-between p-4 px-8 border border-purple-500 border-t-0 rounded-full items-center">
    <div className="flex gap-2">
      <HeaderIcon />
      <NavLinks />
    </div>
    <div className="flex items-center gap-4">
      <SearchBox />
      <ActionArea />
    </div>
  </header>
}

function HeaderIcon() {
  return (
    <div className="flex gap-2">
      <Coins />
      <p>SolSight</p>
    </div>
  )
}

function NavLinks() {
  return (
    <div>
      <Link href="#">Discover</Link>
      <Link href="#">Portfolio</Link>
      <Link href="#">Tracker</Link>
      <Link href="#">Perpetuals</Link>
      <Link href="#">Stake</Link>
    </div>
  )
}

function SearchBox() {
  return (
    <div className="flex gap-4 border dark:border-input rounded-3xl px-4 py-1 items-center w-72">
      <Input type="search" placeholder="Search token, wallet" className="flex-1 border-none dark:bg-transparent p-0" />
      <SearchIcon size="1rem" />
    </div>
  )
}

function ActionArea() {
  const isAuthenticated = false

  if (!isAuthenticated) {
    return (
      <SignInButton />
    )
  }

  const actions = ["favourite", "notification", "settings"]

  return (
    <div className="flex gap-2">
      {actions.map(action =>
        <ActionItem key={action} text={action} />
      )}
    </div>
  )
}

function ActionItem({
  text
}: { text: string }) {
  return <Button variant="outline" className="rounded-full">{text}</Button>
}

function SignInButton() {
  return <Button className="rounded-b-full rounded-t-none px-8 bg-linear-to-r from-purple-500 to-blue-500 text-white font-semibold" asChild>
    <Link href="#">Sign In</Link>
  </Button>
}
