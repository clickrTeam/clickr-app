import React, { useState } from 'react';

const helpTopics = {
  profile: {
    title: 'Editing a Profile',
    content: 'To edit a profile, go to the Profile tab, click "Edit", and update your information. Save changes when done.',
  },
  layer: {
    title: 'Editing a Layer',
    content: 'Layers can be edited by selecting them in the Layers panel. Use the toolbar to adjust properties or delete layers.',
  },
  settings: {
    title: 'Application Settings',
    content: 'Access settings from the main menu. You can customize themes, shortcuts, and other preferences.',
  },
  export: {
    title: 'Exporting Data',
    content: 'To export your project, go to File > Export. Choose your format and destination folder.',
  },
};

const Help: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<keyof typeof helpTopics>('profile');

  return (
    <div className="help-container">
      <aside className="help-sidebar">
        {Object.keys(helpTopics).map((key) => (
          <button
            key={key}
            className={`help-button ${selectedTopic === key ? 'active' : ''}`}
            onClick={() => setSelectedTopic(key as keyof typeof helpTopics)}
          >
            {helpTopics[key as keyof typeof helpTopics].title}
          </button>
        ))}
      </aside>
      <main className="help-content">
        <h2>{helpTopics[selectedTopic].title}</h2>
        <p>{helpTopics[selectedTopic].content}</p>
      </main>
    </div>
  );
};

export default Help;
