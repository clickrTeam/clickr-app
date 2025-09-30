import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'

function Training(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  const { profile, layer_index } = location.state as {
    profile: Profile
    layer_index: number
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        Profile: {profile.profile_name} | Layer: {profile.layers[layer_index].layer_name}
      </h2>

      <div className="text-4xl font-bold text-cyan-600 mb-24">Ryan&apos;s rank 3</div>

      <Button
        size="lg"
        variant="outline"
        className="border-cyan-600 text-black hover:bg-cyan-700 px-8"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
    </div>
  )
}

export default Training
