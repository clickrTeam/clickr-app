import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/CodeBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'profile-structure', title: 'Profile Structure' },
  { id: 'configuration', title: 'Configuration' },
  { id: 'layers', title: 'Layers' },
  { id: 'statements', title: 'Statements' },
  { id: 'behavior', title: 'Behavior' },
  { id: 'triggers', title: 'Triggers' },
  { id: 'binds', title: 'Binds' },
  { id: 'keys', title: 'Keys' },
];

const CliDocs = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 96; // 96px = 24 * 4 (scroll-mt-24)

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionVisibility = new Map<string, number>();

    // Helper function to update active section based on visibility
    const updateActiveSection = () => {
      let maxVisibility = 0;
      let mostVisibleSection = 'introduction';

      sectionVisibility.forEach((visibility, sectionId) => {
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleSection = sectionId;
        }
      });

      if (maxVisibility > 0) {
        setActiveSection(mostVisibleSection);
      }
    };

    // Create an Intersection Observer for each section
    sections.forEach((section) => {
      const element = sectionRefs.current[section.id];
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Use intersectionRatio which is more accurate
            // Also consider the position - prefer sections near the top of viewport
            const rect = entry.boundingClientRect;
            const viewportHeight = window.innerHeight;
            
            // Calculate a score that favors sections in the upper portion of viewport
            let visibilityScore = entry.intersectionRatio;
            
            if (entry.isIntersecting) {
              // Boost score if section is in the upper portion of viewport
              const topPosition = rect.top;
              const bottomPosition = rect.bottom;
              const centerY = (topPosition + bottomPosition) / 2;
              const viewportCenter = viewportHeight / 2;
              
              // Higher score for sections closer to the top of viewport
              if (centerY < viewportCenter) {
                visibilityScore *= 1.5;
              }
              
              sectionVisibility.set(section.id, visibilityScore);
            } else {
              sectionVisibility.set(section.id, 0);
            }
          });
          
          // Update active section after processing all entries
          updateActiveSection();
        },
        {
          rootMargin: '-10% 0px -50% 0px', // Trigger when section enters upper portion of viewport
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    // Cleanup observers on unmount
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24">
        <div className="flex gap-8">
          <aside className="w-1/4 sticky top-24 self-start">
            <nav className="flex flex-col space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={cn(
                    'text-lg font-medium cursor-pointer transition-colors',
                    activeSection === section.id
                      ? 'text-clickr-blue'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section.id);
                    setActiveSection(section.id);
                  }}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>
          <main className="w-3/4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Card
                id="introduction"
                ref={(el) => (sectionRefs.current['introduction'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Introduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Welcome to the Clickr CLI documentation. This guide will walk you through the process of creating and managing your keyboard profiles using our powerful command-line tool. The Clickr CLI uses a simple, human-readable Domain-Specific Language (DSL) to define your keyboard layouts in <code className="inline-code">.clickr</code> files.
                  </p>
                </CardContent>
              </Card>

              <Card
                id="profile-structure"
                ref={(el) => (sectionRefs.current['profile-structure'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Profile Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    A <code className="inline-code">.clickr</code> file has a simple, hierarchical structure. At the top level, you define a profile, which contains a configuration block and one or more layer blocks.
                  </p>
                  <CodeBlock code={`profile "My Profile"

config {
    # Global settings go here
}

layer "base" {
    # Key bindings for the base layer go here
}

layer "gaming" {
    # Key bindings for the gaming layer go here
}`} />
                </CardContent>
              </Card>

              <Card
                id="configuration"
                ref={(el) => (sectionRefs.current['configuration'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The <code className="inline-code">config</code> block allows you to set global parameters for your profile.
                  </p>
                  <ul>
                    <li><code className="inline-code">default_layer</code>: The name of the layer that is active when the profile starts. Defaults to the frist layer defined if omitted.</li>
                    <li><code className="inline-code">default_behavior</code>: The default behavior for triggers. Can be <code className="inline-code">capture</code>, <code className="inline-code">release</code>, or <code className="inline-code">wait</code>.</li>
                    <li><code className="inline-code">tap_timeout</code>: The maximum duration in milliseconds to recognize a tap. Defaults to 200ms.</li>
                    <li><code className="inline-code">hold_time</code>: The minimum duration in milliseconds to recognize a hold. Defaults to 200ms.</li>
                    <li><code className="inline-code">chord_timeout</code>: The maximum time in milliseconds between keys in a chord. Defaults to 200ms.</li>
                    <li><code className="inline-code">sequence_timeout</code>: The maximum time in milliseconds between keys in a sequence. Defaults to 200ms.</li>
                    <li><code className="inline-code">combo_timeout</code>: The maximum time in milliseconds for complex combos. Defaults to 200ms.</li>
                  </ul>
                  <CodeBlock code={`config {
    default_layer = "base"
    tap_timeout = 200
    hold_time = 200
}`} />
                </CardContent>
              </Card>

              <Card
                id="layers"
                ref={(el) => (sectionRefs.current['layers'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Layers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Layers allow you to create different contexts for your key bindings. You can switch between layers to change the behavior of your keyboard.
                  </p>
                  <CodeBlock code={`layer "base" {
    # Pressing 'a' sends 'b'
    a = b
    # Hold down caps lock to switch to the "symbols" layer
    hold(capslock) = layer("symbols")
}

layer "symbols" {
    # While in the "symbols" layer, pressing 'a' sends 'c'
    a = c
    # Release caps lock to go back to the "base" layer
    ^capslock = layer("base")
}`} />
                </CardContent>
              </Card>

              <Card
                id="statements"
                ref={(el) => (sectionRefs.current['statements'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Statements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    A statement is the basic building block of a layer. It consists of a trigger on the left-hand side and a bind on the right-hand side, separated by an equals sign.
                  </p>
                  <CodeBlock code={`<trigger> = <bind>`} />
                  <h5 className="text-xl font-bold mt-4">Conflicting Statements</h5>
                  <p>
                    You cannot have duplicate triggers within the same layer. If you define the same trigger more than once, the CLI will raise an error.
                  </p>
                </CardContent>
              </Card>
              <Card
                id="behavior"
                ref={(el) => (sectionRefs.current['behavior'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Behavior</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The <code className="inline-code">behavior</code> parameter controls how Clickr handles
                    the underlying key events when a trigger is processed.
                  </p>
                  <ul>
                    <li>
                      <code className="inline-code">capture</code>: key events are captured (not output
                      immediately). If the trigger fails, the captured events are released normally.
                    </li>
                    <li>
                      <code className="inline-code">wait</code>: key events are captured and only emitted
                      if the trigger succeeds. If it fails, the events are discarded.
                    </li>
                    <li>
                      <code className="inline-code">release</code>: key events are always output immediately,
                      regardless of whether the chord, sequence, combo, tap, or hold succeeds or fails.
                    </li>
                  </ul>
                  <p>
                    All complex triggers — <code className="inline-code">chord</code>,{' '}
                    <code className="inline-code">sequence</code>,{' '}
                    <code className="inline-code">combo</code>,{' '}
                    <code className="inline-code">tap</code>, and{' '}
                    <code className="inline-code">hold</code> — optionally accept both a{' '}
                    <code className="inline-code">behavior</code> override and a{' '}
                    <code className="inline-code">timeout</code>. If omitted, Clickr uses the
                    profile's <code className="inline-code">default_behavior</code> and the appropriate
                    timeout setting from the config block.
                  </p>
                  <CodeBlock
                    code={`chord([a, b], release, 300) = c
sequence([a, b, c], capture, 500) = d
combo([_a, ^b], wait, 400) = e
tap(a, release, 200) = f
hold(a, capture, 300) = g`}
                  />
                </CardContent>
              </Card>

              <Card
                id="triggers"
                ref={(el) => (sectionRefs.current['triggers'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Triggers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Triggers define what causes a bind to occur. Clickr supports a variety of trigger types.
                  </p>
                  <h3 className="text-2xl font-bold mt-4">Simple Key</h3>
                  <p>A simple key press. You can also use prefixes for press (<code className="inline-code">_</code>) and release (<code className="inline-code">^</code>).</p>
                  <CodeBlock code={`a = b
_a = b # Trigger on press
^a = b # Trigger on release`} />

                  <h3 className="text-2xl font-bold mt-4">Hold</h3>
                  <p>Holding a key for a specified duration.</p>
                  <CodeBlock code={`hold(a) = b`} />

                  <h3 className="text-2xl font-bold mt-4">Tap</h3>
                  <p>Tapping a key (pressing and releasing quickly).</p>
                  <CodeBlock code={`tap(a) = b`} />

                  <h3 className="text-2xl font-bold mt-4">Sequence</h3>
                  <p>A sequence of keys pressed in order.</p>
                  <CodeBlock code={`sequence([a, b, c]) = d`} />

                  <h3 className="text-2xl font-bold mt-4">Chord</h3>
                  <p>A combination of keys pressed simultaneously.</p>
                  <CodeBlock code={`chord([a, b, c]) = d`} />

                  <h3 className="text-2xl font-bold mt-4">Combo</h3>
                  <p>A complex combination of key presses and releases.</p>
                  <CodeBlock code={`combo([_a, ^b, c]) = d`} />

                  <h3 className="text-2xl font-bold mt-4">App Focused</h3>
                  <p>A trigger that only fires when a specific application is focused.</p>
                  <CodeBlock code={`app_focused("Google Chrome") = layer("chrome-shortcuts")`} />
                </CardContent>
              </Card>

              <Card
                id="binds"
                ref={(el) => (sectionRefs.current['binds'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Binds</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    Binds are what happen when a trigger is activated. You can assign a single bind or a list of binds to a trigger.
                  </p>
                  <h3 className="text-2xl font-bold mt-4">Send a Key</h3>
                  <p className="mb-2">Send a key press, with optional press (<code className="inline-code">_</code>) or release (<code className="inline-code">^</code>) modifiers.</p>
                  <CodeBlock code={`a = b
a = [_shift, b, ^shift] # Sends Shift+B`} />

                  <h3 className="text-2xl font-bold mt-4">Switch Layer</h3>
                  <p className="mb-2">Switch to a different layer.</p>
                  <CodeBlock code={`a = layer("gaming")`} />

                  <h3 className="text-2xl font-bold mt-4">Open Application</h3>
                  <p className="mb-2">Launch an application.</p>
                  <CodeBlock code={`a = open_app("Spotify")`} />

                  <h3 className="text-2xl font-bold mt-4">Run a Script</h3>
                  <p className="mb-2">Execute a shell script.</p>
                  <CodeBlock code={`a = run("bash", "echo 'Hello, World!'")`} />

                  <h3 className="text-2xl font-bold mt-4">None</h3>
                  <p className="mb-2">Do nothing. This is useful for disabling a key.</p>
                  <CodeBlock code={`a = none`} />
                </CardContent>
              </Card>

              <Card
                id="keys"
                ref={(el) => (sectionRefs.current['keys'] = el)}
                className="scroll-mt-24 bg-slate-50"
              >
                <CardHeader>
                  <CardTitle>Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The following key names are supported in <code className="inline-code">.clickr</code> files.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Name</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><code className="inline-code">a</code> to <code className="inline-code">z</code></TableCell>
                        <TableCell>Letters</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">0</code> to <code className="inline-code">9</code></TableCell>
                        <TableCell>Numbers</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">f1</code> to <code className="inline-code">f12</code></TableCell>
                        <TableCell>Function keys</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">shiftleft</code>, <code className="inline-code">shiftright</code></TableCell>
                        <TableCell>Shift</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">ctrlleft</code>, <code className="inline-code">ctrlright</code></TableCell>
                        <TableCell>Control</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">altleft</code>, <code className="inline-code">altright</code></TableCell>
                        <TableCell>Alt</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">metaleft</code>, <code className="inline-code">metaright</code></TableCell>
                        <TableCell>Command on macOS / Windows key on Windows</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">esc</code></TableCell>
                        <TableCell>Escape</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">tab</code></TableCell>
                        <TableCell>Tab</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">capslock</code></TableCell>
                        <TableCell>Caps Lock</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">enter</code></TableCell>
                        <TableCell>Enter</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">backspace</code></TableCell>
                        <TableCell>Backspace</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">space</code></TableCell>
                        <TableCell>Space</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">insert</code></TableCell>
                        <TableCell>Insert</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">delete</code></TableCell>
                        <TableCell>Delete</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">home</code></TableCell>
                        <TableCell>Home</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">end</code></TableCell>
                        <TableCell>End</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">pageup</code></TableCell>
                        <TableCell>Page Up</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">pagedown</code></TableCell>
                        <TableCell>Page Down</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">up</code></TableCell>
                        <TableCell>Up Arrow</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">down</code></TableCell>
                        <TableCell>Down Arrow</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">left</code></TableCell>
                        <TableCell>Left Arrow</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">right</code></TableCell>
                        <TableCell>Right Arrow</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">-</code></TableCell>
                        <TableCell>Minus</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">=</code></TableCell>
                        <TableCell>Equals</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">[</code></TableCell>
                        <TableCell>Left Bracket</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">]</code></TableCell>
                        <TableCell>Right Bracket</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">\</code></TableCell>
                        <TableCell>Backslash</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">;</code></TableCell>
                        <TableCell>Semicolon</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">'</code></TableCell>
                        <TableCell>Quote</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">,</code></TableCell>
                        <TableCell>Comma</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">.</code></TableCell>
                        <TableCell>Period</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">/</code></TableCell>
                        <TableCell>Slash</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="inline-code">`</code></TableCell>
                        <TableCell>Grave</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CliDocs;
