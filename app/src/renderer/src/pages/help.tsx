import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

type TopicKey = 'general' | 'profile' | 'layer' | 'trigger' | 'bind' | 'tips'

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
            Clickr is a cross platform keyboard remapper. With Clickr, you can change any key on your keyboard
            to another key, shortcut, or combination of keys. You can do this whether you're on Windows, Mac,
            or Linux. Clickr is designed to be simple to use, so anyone can have the freedom to use their keyboard
            in a way that works best for them.
          </p>
        ),
      },
      {
        id: 'key-features',
        heading: 'Key Features',
        body: (
          <p>
            Clickr is fully cross platform compatible, this means that you can create a profile on your Mac and
            load it on your Windows PC, and it will just work! You can also download other Profiles from our website
            and modify those to your liking. The actual remapping process is done through another application called 
            'Keybinder'. The Keybinder runs silently in the background, so you won't have to have the Clickr application
            open in order to remap your keys.
          </p>
        ),
      },
    ],
  },

  profile: {
    title: 'Profile',
    sections: [
      {
        id: 'what-is-profile',
        heading: 'What is a Profile?',
        body: (
          <p>
            A Profile is a collection of Layers. The simplest way to think of a Profile is that it is
            person-specific. For example, if John and Jane both used the same computer, there would be
            a profile for John, and one for Jane. In the profile, each person will customize their keyboard
            experience to best suit them.
          </p>
        ),
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
        ),
      },
      {
        id: 'edit-profile',
        heading: 'How do I edit a Profile?',
        body: (
          <>
            <p>To edit a profile:</p>
            <ol className="list-decimal ml-6">
              <li>Click on the "Mappings" button on the top of the application.</li>
              <li>Click the "Edit" button on the Profile you want to edit.</li>
              <li>You are now editing your Profile! See the Layers help page for more details.</li>
            </ol>
          </>
        ),
      },
    ],
  },

  layer: {
    title: 'Layer',
    sections: [
      {
        id: 'what-is-layer',
        heading: 'What is a Layer?',
        body: (<p>A Layer is a customizable keyboard layout made up of the key bindings
            that you create. Each layer is associated with the Profile that creates it.
            A common use of a Layer is to be task specific. For example, you could create
            a Layer for when you use a Web Browser, and map buttons to "Forward", "Back", etc.
            Another common use is to have a Layer dedicated to a specific keyboard layout, like
            DVORAK or COLEMAK.
        </p>),
      },
      {
        id: 'manage-layers',
        heading: 'Managing Layers',
        body: (<p>Each Profile can have as many Layers as you want, but always must have
            at least one. You can switch between Layers whenever you want by setting a bind
            to "Switch Layer" and activating that bind. It is important to consider how you will
            navigate your Layers. If you have a button to switch from Layer 1 to Layer 2, but don't
            have a button to get back, you will be stuck on Layer 2. Make sure you consider navigation
            when creating your setup.
        </p>),
      },
    ],
  },

  trigger: {
    title: 'Triggers',
    sections: [
      {
        id: 'what-is-trigger',
        heading: 'What is a Trigger',
        body: <p>Triggers are device events (key press, mouse button, etc.) that fire binds.</p>,
      },
      {
        id: 'config-trigger',
        heading: 'Configuring a Trigger',
        body: (
          <p>
            When creating a bind, pick the trigger type, set modifiers and optional conditions,
            then test it in the preview area.
          </p>
        ),
      },
    ],
  },

  bind: {
    title: 'Binds',
    sections: [
      {
        id: 'what-is-bind',
        heading: 'What is a Bind',
        body: <p>Binds connect a trigger to an action (command, macro, sequence).</p>,
      },
      {
        id: 'create-bind',
        heading: 'Creating a Bind',
        body: (
          <ol className="list-decimal ml-6">
            <li>Select a trigger.</li>
            <li>Choose an action.</li>
            <li>Adjust parameters and save.</li>
          </ol>
        ),
      },
    ],
  },

  tips: {
    title: 'Tips',
    sections: [
      {
        id: 'layer-navigation',
        heading: 'Layer Navigation',
        body: <p>create layer hub</p>,
      }
    ],
  },
}

const sidebarButtons: { key: TopicKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'profile', label: 'Profile' },
  { key: 'layer', label: 'Layer' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'bind', label: 'Bind' },
  { key: 'tips', label: 'Tips'}
]

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

const Help: React.FC = () => {
  const location = useLocation()

  const topic = useMemo((): TopicKey => {
    const parts = location.pathname.split('/').filter(Boolean)
    const last = (parts[parts.length - 1] || '').toLowerCase()
    return ['general', 'profile', 'layer', 'trigger', 'bind', 'tips'].includes(last)
      ? (last as TopicKey)
      : 'general'
  }, [location.pathname])

  return (
    <div className="h-full w-full flex bg-neutral-50">
      <aside className="w-64 min-w-[200px] border-r border-neutral-200 bg-white p-4 flex flex-col gap-3">
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

        <div className="mt-auto">
          <Link to="/" className="block text-sm text-neutral-600 hover:underline">
            ← Return to Home
          </Link>
        </div>
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
