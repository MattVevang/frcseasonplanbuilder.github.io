import { ReactNode } from 'react'

interface HelpSection {
  title: string
  content: ReactNode
}

export const overviewHelp: HelpSection = {
  title: 'About FRC Season Plan Builder',
  content: (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What is this tool?</h3>
        <p className="text-gray-600 dark:text-gray-300">
          FRC Season Plan Builder is a collaborative tool designed to help FIRST Robotics teams quickly brainstorm and prioritize robot capabilities and match strategies during pre-season planning.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How it works</h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li>Enter a unique session code to create or join a planning session</li>
          <li>Multiple teammates can join the same session and collaborate in real-time</li>
          <li>Add capabilities and strategies, then prioritize them together</li>
          <li>Changes sync automatically across all connected devices</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Intended workflow</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          This tool is designed for rapid brainstorming—not long-term storage. Here's the recommended workflow:
        </p>
        <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li>Gather your team and open the tool on multiple devices</li>
          <li>Brainstorm capabilities and strategies together</li>
          <li>Prioritize and reorder items as a team</li>
          <li><strong>Export your plan</strong> when finished</li>
          <li>Import the data into your team's preferred tracking system (Jira, Azure DevOps, GitHub Projects, Confluence, Trello, etc.)</li>
        </ol>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Session codes</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Choose something unique that others won't guess—combining your team number with a memorable phrase works well (e.g., "1234-turbo-bots"). Anyone with your code can view and edit your session.
        </p>
      </section>
    </div>
  ),
}

export const capabilitiesHelp: HelpSection = {
  title: 'Robot Capabilities',
  content: (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What are capabilities?</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Capabilities are the features and abilities you want your robot to have. Think of them as the "what" your robot should be able to do—like "floor pickup," "climb," or "shoot high goal."
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Priority levels</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Each capability has a priority level to help your team decide what to build first:
        </p>
        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
          <li><span className="font-medium text-red-600 dark:text-red-400">Critical</span> — Must have; robot is incomplete without it</li>
          <li><span className="font-medium text-orange-600 dark:text-orange-400">High</span> — Very important for competitive success</li>
          <li><span className="font-medium text-yellow-600 dark:text-yellow-400">Medium</span> — Important but can wait if needed</li>
          <li><span className="font-medium text-blue-600 dark:text-blue-400">Low</span> — Nice to have if time permits</li>
          <li><span className="font-medium text-gray-600 dark:text-gray-400">Very Low</span> — Stretch goal or future consideration</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ordering capabilities</h3>
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Drag and drop</strong> to reorder capabilities. The rank number (1, 2, 3...) reflects your team's build order priority. Sorting by Priority or Title only changes the display order—it won't change the actual rank numbers.
        </p>
      </section>
    </div>
  ),
}

export const strategyHelp: HelpSection = {
  title: 'Match Strategy',
  content: (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What are strategies?</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Strategies are specific actions or plays you plan to execute during matches. They're tied to match phases and include expected point values to help project your scoring potential.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Match phases</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
          <li><span className="font-medium text-green-600 dark:text-green-400">Autonomous (15s)</span> — Robot operates independently at match start</li>
          <li><span className="font-medium text-blue-600 dark:text-blue-400">Teleop (2:15)</span> — Driver-controlled period</li>
          <li><span className="font-medium text-purple-600 dark:text-purple-400">Endgame (20s)</span> — Final moments, often for climbing/parking</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cycles per phase</h3>
        <p className="text-gray-600 dark:text-gray-300">
          If a strategy is repeated multiple times during its phase (like scoring game pieces), enter how many cycles you expect to complete. The score projection will multiply your expected points by the cycle count.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Score projection</h3>
        <p className="text-gray-600 dark:text-gray-300">
          The score projection at the top shows your estimated match score based on all non-defensive strategies. Use this to evaluate whether your strategy is competitive and identify where to focus improvements.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Defensive strategies</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Mark strategies as "defensive" if they don't directly score points (like blocking opponents). These are tracked separately and won't affect your score projection.
        </p>
      </section>
    </div>
  ),
}
