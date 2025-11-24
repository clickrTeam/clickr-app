import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

type TopicKey = 'general' | 'profile' | 'layer' | 'trigger' | 'bind' | 'training' | 'tips'

type HelpSection = {
  id: string
  heading: string
  body: React.ReactNode
}

type HelpTopic = {
  title: string
  sections: HelpSection[]
}

const helpTopics: Record<TopicKey, HelpTopic> = {
  general: {
    title: 'General Overview',
    sections: [
      {
        id: 'what-is-clickr',
        heading: 'What is Clickr',
        body: (
          <p>
            Clickr is a cross platform keyboard remapper. With Clickr, you can change any key on
            your keyboard to another key, shortcut, or combination of keys. You can do this whether
            you're on Windows, Mac, or Linux. Clickr is designed to be simple to use, so anyone can
            have the freedom to use their keyboard in a way that works best for them.
          </p>
        )
      },
      {
        id: 'key-features',
        heading: 'Key Features',
        body: (
          <p>
            Clickr is fully cross platform compatible, this means that you can create a profile on
            your Mac and load it on your Windows PC, and it will just work! You can also download
            other Profiles from our website and modify those to your liking. The actual remapping
            process is done through another application called 'Keybinder'. The Keybinder runs
            silently in the background, so you won't have to have the Clickr application open in
            order to remap your keys.
          </p>
        )
      },
      {
        id: 'getting-started',
        heading: 'Getting Started',
        body: (
          <>
            <p>You can get stared with Clickr by following these steps:</p>
            <ol className="list-decimal ml-6">
              <li>Create a new Profile or download one from the website.</li>
              <li>Edit the Profile and change the Layer(s)</li>
              <li>Save your changes.</li>
              <li>Activate your Profile!</li>
            </ol>
          </>
        )
      }
    ]
  },

  profile: {
    title: 'Profile',
    sections: [
      {
        id: 'what-is-profile',
        heading: 'What is a Profile?',
        body: (
          <p>
            A Profile is a collection of Layers. The simplest way to think of a Profile is that it
            is person-specific. For example, if John and Jane both used the same computer, there
            would be a profile for John, and one for Jane. In the profile, each person will
            customize their keyboard experience to best suit them.
          </p>
        )
      },
      {
        id: 'create-profile',
        heading: 'How do I create a Profile?',
        body: (
          <>
            <p>To create a profile:</p>
            <ol className="list-decimal ml-6">
              <li>Click on the "Mappings" button on the top of the application.</li>
              <li>Click on the "New Local Mapping" button to open the Profile creation window.</li>
              <li>Give it a name and optional description.</li>
              <li>Your new Profile has been created!</li>
            </ol>
          </>
        )
      },
      {
        id: 'edit-profile',
        heading: 'Editing a Profile',
        body: (
          <>
            <p>To edit a profile:</p>
            <ol className="list-decimal ml-6">
              <li>Click on the "Mappings" button on the top of the application.</li>
              <li>Click the "Edit" button on the Profile you want to edit.</li>
              <li>You are now editing your Profile! See the Layers help page for more details.</li>
            </ol>
          </>
        )
      }
    ]
  },

  layer: {
    title: 'Layer',
    sections: [
      {
        id: 'what-is-layer',
        heading: 'What is a Layer?',
        body: (
          <p>
            A Layer is a customizable keyboard layout made up of the key bindings that you create.
            Each layer is associated with the Profile that creates it. A common use of a Layer is to
            be task specific. For example, you could create a Layer for when you use a Web Browser,
            and map buttons to "Forward", "Back", etc. Another common use is to have a Layer
            dedicated to a specific keyboard layout, like DVORAK or COLEMAK.
          </p>
        )
      },
      {
        id: 'manage-layers',
        heading: 'Managing Layers',
        body: (
          <p>
            Each Profile can have as many Layers as you want, but always must have at least one. You
            can switch between Layers whenever you want by setting a bind to "Switch Layer" and
            activating that bind. It is important to consider how you will navigate your Layers. If
            you have a button to switch from Layer 1 to Layer 2, but don't have a button to get
            back, you will be stuck on Layer 2. Make sure you consider navigation when creating your
            setup.
          </p>
        )
      },
      {
        id: 'edit-layers',
        heading: 'Editing a Layer',
        body: (
          <>
            <p>To edit a layer:</p>
            <ol className="list-decimal ml-6">
              <li>Click on the "Mappings" button on the top of the application.</li>
              <li>Click the "Edit" button on the Profile you want to edit.</li>
              <li>
                Here are your layers are listed. You can create or delete layers using the provided
                buttons.
              </li>
              <li>
                Click on a key to edit the bindings. You can read more about these in the Trigger
                and Bind section.
              </li>
              <li>When you are done editing, save your changes.</li>
            </ol>
          </>
        )
      }
    ]
  },

  trigger: {
    title: 'Triggers',
    sections: [
      {
        id: 'what-is-trigger',
        heading: 'What is a Trigger',
        body: (
          <p>
            Triggers are device events (usually a key press) that activate binds. You can think of
            this as what you need to do to activate your bind. There are several kinds of triggers
            that you can choose from. You can even have multiple triggers per key!
          </p>
        )
      },
      {
        id: 'types-of-triggers',
        heading: 'Types of Triggers',
        body: (
          <>
            <p>
              There are several types of Triggers that you can choose from. Using multiple kinds of
              Triggers really expands the customization options. Here are the types of Triggers that
              you can choose from:
            </p>
            <ol className="list-decimal ml-6">
              <li>
                Tap: This is the most basic trigger. Tap this key once and it will activate your
                bind is.
              </li>
              <li>
                Tap Sequence: This is a series of taps that will activate a bind. These are on a
                timer, if you are too slow the bind you want won't activate. A common use case would
                be a double or triple tap. For example, you could double tap '1' for '!'.
              </li>
              <li>
                Hold: Hold this key down to activate your bind. These are on a timer, if you are too
                slow the bind you want won't activate.
              </li>
            </ol>
          </>
        )
      },
      {
        id: 'config-trigger',
        heading: 'Configuring a Trigger',
        body: (
          <p>
            To configure a trigger, first navigate to the Profile you want to edit, select edit,
            then click on the layer you want to modify. Click on the key you want to be your
            Trigger, and then hit the + button. A menu will appear with different kinds of Triggers.
            Select whichever one makes the most sense for you.
          </p>
        )
      }
    ]
  },

  bind: {
    title: 'Binds',
    sections: [
      {
        id: 'what-is-bind',
        heading: 'What is a Bind',
        body: (
          <p>
            A Bind is what is activated when you press the key associated with a Trigger. A Bind is
            always tied to a Trigger. This is what allows full customization of the keyboard. Binds
            can be as simple as changing one key to another, like Caps Lock to Ctrl for example.
            They can also be quite complicated.
          </p>
        )
      },
      {
        id: 'types-of-binds',
        heading: 'Types of Binds',
        body: (
          <>
            <p>
              There are several types of Binds that you can choose from. This is where things can be
              as simple or complicated as you want. It is recommended to do simpler Binds when you
              are just starting out. Here are the types of Binds that you can choose from:
            </p>
            <ol className="list-decimal ml-6">
              <li>Tap: This the simplest kind of bind. It will change one key to another.</li>
              <li>
                Press: This is specifically a key down. This should be paired with a Release Bind.
              </li>
              <li>
                Release: This is specifically a key up. When paired with a Press you are able to do
                2 actions off one physical key press.
              </li>
              <li>
                Macro: These are Binds that contain other Binds. For example, you could bind a key
                to be three Taps corresponding to Ctrl + Alt + Del if you were on Windows. Macro
                Binds can be quite complicated.
              </li>
              <li>
                Timed Macro: These are Macros with a time delay between each Bind. For example, you
                could have a one second delay between 'Copy' and 'Paste'.
              </li>
            </ol>
          </>
        )
      },
      {
        id: 'create-bind',
        heading: 'Creating a Bind',
        body: (
          <p>
            To configure a Bind, first navigate to the Profile you want to edit, select edit, then
            click on the layer you want to modify. Click on the key you want to be your Trigger, and
            then type what button you want the Bind to correspond to. You can also use the menu to
            select an action if it is not a key (for example 'Copy). You can then click on the Binds
            at the bottom of the app and change the type of Bind that it is.
          </p>
        )
      }
    ]
  },
  training: {
    title: 'Training',
    sections: [
      {
        id: 'minigame',
        heading: 'Training Minigame',
        body: (
          <p>
            Within Clickr, we have included a small minigame to help you learn your new binds. After
            changing what some keys on your keyboard do (and realizing that the labels on your
            keycaps are no longer accurate), it is difficult to memorize what the function of each
            key in your different layers may be. To aid in memorization, try out our game!
          </p>
        )
      },
      {
        id: 'navigate-to-game',
        heading: 'Navigating to the Game',
        body: (
          <>
            <ol className="list-decimal ml-6">
              <li>Go to the mappings page using the navbar on the top of the Clickr app</li>
              <li>Click edit on the profile you want to practice</li>
              <li>
                Select the layer that you want to practice. The training minigame works on a single
                layer so that you are able to learn quicker.
              </li>
              <li>Click on the Start Training button in the top right of the screen </li>
              <li>
                Select the difficulty you want using the slider, 1 is the easiest and 10 is the
                hardest. Optionally, click the How to Play button for a detailed description of the
                game.
              </li>
            </ol>
          </>
        )
      }
    ]
  },
  tips: {
    title: 'Tips',
    sections: [
      {
        id: 'layer-navigation',
        heading: 'Layer Navigation',
        body: (
          <p>
            It may be helpful to create a Layer hub". This is a layer that only contains layer
            swapping binds to other layers. This way, from any layer (other than the layer hub) you
            can have a single button to switch to the layer hub. Then on a layer hub, you can use
            the numbers to switch to Layer 1, Layer 2, ... etc. This can simplify navigation for
            you.
          </p>
        )
      },
      {
        id: 'shortcuts',
        heading: 'Shortcuts',
        body: (
          <>
            <p>
              When creating a bind that represents a common shortcut such as Copy or Paste, you
              should use the premade Shortcut option instead of mapping it yourself by creating a
              Ctrl + C bind. The reason for this is that Clickr will be able to more easily
              translate these predefined shortcuts between different operating systems. In order to
              do this:
            </p>
            <ol className="list-decimal ml-6">
              <li>Navigate to the layer editing page.</li>
              <li>Select the key you want to assign to a shortcut.</li>
              <li>
                Click the + button at the bottom of the screen to open a menu with different key
                types.
              </li>
              <li>Click on Shortcuts and then select the shortcut you want to use. </li>
            </ol>
          </>
        )
      }
    ]
  }
}

const sidebarButtons: { key: TopicKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'profile', label: 'Profile' },
  { key: 'layer', label: 'Layer' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'bind', label: 'Bind' },
  { key: 'training', label: 'Training' },
  { key: 'tips', label: 'Tips' }
]

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } }
}

const Help: React.FC = () => {
  const location = useLocation()

  const topic = useMemo((): TopicKey => {
    const parts = location.pathname.split('/').filter(Boolean)
    const last = (parts[parts.length - 1] || '').toLowerCase()
    return ['general', 'profile', 'layer', 'trigger', 'bind', 'training', 'tips'].includes(last)
      ? (last as TopicKey)
      : 'general'
  }, [location.pathname])

  return (
    <div className="h-full w-full flex bg-gray-50">
      <aside className="w-64 min-w-[200px] border-r border-neutral-200 bg-white p-4 flex flex-col gap-3">
        <Link to="/" className="block text-sm text-neutral-600 hover:underline pb-2">
          ← Return to Home
        </Link>
        <h3 className="text-lg font-semibold">Help</h3>

        <nav className="flex flex-col gap-2">
          {sidebarButtons.map((btn) => {
            const to = btn.key === 'general' ? '/help' : `/help/${btn.key}`
            const isActive = topic === btn.key
            return (
              <Link
                key={btn.key}
                to={to}
                className={
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ' +
                  (isActive ? 'bg-cyan-600 text-white' : 'text-neutral-700 hover:bg-neutral-100')
                }
              >
                {btn.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <motion.main
        key={location.pathname}
        className="flex-1 p-8 overflow-auto"
        initial={pageMotion.initial}
        animate={pageMotion.animate}
        exit={pageMotion.exit}
      >
        <article className="max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">{helpTopics[topic].title}</h1>

          <section className="space-y-6">
            {helpTopics[topic].sections.map((section) => (
              <div key={section.id} className="border-b border-neutral-200 pb-4">
                <h2 id={section.id} className="text-lg font-semibold mb-2">
                  {section.heading}
                </h2>
                <div className="text-sm text-neutral-700">{section.body}</div>
              </div>
            ))}
          </section>
        </article>
      </motion.main>
    </div>
  )
}

export default Help
