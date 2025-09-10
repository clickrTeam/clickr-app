import { Button } from '@renderer/components/ui/button'



interface LoginProps {
  login: () => void
}

function Login({ login }: LoginProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6 text-black">Login</h1>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md ">
        {/* Simple mock login form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Username</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              placeholder="Enter your password"
            />
          </div>
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={login}>
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Login
