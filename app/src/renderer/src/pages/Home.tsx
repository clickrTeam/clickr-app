import { Button } from '@renderer/components/ui/button'
import { Link } from 'react-router-dom'

function Home(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-3xl font-bold text-cyan-600 mb-24">Welcome to Clickr</h1>

      <div className="flex space-x-12 mt-10">
        <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-black px-8" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-cyan-600 text-black hover:bg-cyan-700 px-8"
          asChild
        >
          <Link to="/my-mappings">My Mappings</Link>
        </Button>
      </div>
    </div>
  )
}

export default Home
