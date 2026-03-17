import { ReactNode } from 'react'
import { MATCH_PHASES, formatDuration } from '../config/matchTiming'

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
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Session codes & PINs</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Choose something unique—combining your team number with a memorable phrase works well (e.g., "1234-turbo-bots"). New sessions require a 4-digit PIN that you'll share with teammates.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          <strong>Tip:</strong> Click the QR code icon in the header to display a scannable code that includes your PIN—teammates can scan it to join directly without typing anything.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data retention & backups</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Session data is automatically deleted after 120 days of inactivity. To preserve your work:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li><strong>Export</strong> saves your entire plan as a JSON file to your computer</li>
          <li><strong>Import</strong> restores data from an exported file into your current session</li>
          <li>You can import old backups into a new session—the data merges into whichever session you're currently in</li>
        </ul>
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
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Categories &amp; subsystems</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Capabilities can be tagged with one or more categories (e.g. Drivetrain, Intake, Autonomous) to organize them by subsystem. A single capability can belong to multiple categories—for example, a "drive to scoring position" capability might belong to both Drivetrain and Autonomous.
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li>Click <strong>Categories</strong> to manage your category list (add, rename, recolor, or delete)</li>
          <li>Assign categories when adding or editing a capability</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">List &amp; Board views</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Two ways to view your capabilities:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li><strong>List view</strong> — A flat ranked list sorted by priority and rank. Drag and drop to reorder.</li>
          <li><strong>Board view</strong> — A swimlane board grouped by category. Drag items between categories to reassign them, or drag within a category to reorder.</li>
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
          Strategies are specific actions or plays you plan to execute during matches. They're tied to match phases and include expected point values and cycle times to help project your scoring and time budget.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Game plans</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Organize strategies into separate game plans to compare different approaches:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li>Use the dropdown to switch between plans</li>
          <li>Click the <strong>copy icon</strong> to duplicate a plan with all its strategies</li>
          <li>Click the <strong>pencil icon</strong> to rename a plan</li>
          <li>Each plan has its own score projection and time budget</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Match phases</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-300">
          <li><span className="font-medium text-green-600 dark:text-green-400">{MATCH_PHASES.auto.label} ({formatDuration(MATCH_PHASES.auto.duration)})</span> — Robot operates independently at match start</li>
          <li><span className="font-medium text-blue-600 dark:text-blue-400">{MATCH_PHASES.teleop.label} ({formatDuration(MATCH_PHASES.teleop.duration)})</span> — Driver-controlled period</li>
          <li><span className="font-medium text-purple-600 dark:text-purple-400">{MATCH_PHASES.endgame.label} ({formatDuration(MATCH_PHASES.endgame.duration)})</span> — Final moments for endgame scoring (BASE return, climbing, etc.)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cycle time & count</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Enter how long each cycle takes (in seconds) and how many cycles you plan to complete. This data powers both the score projection (points × cycles) and the time budget to ensure your plan fits within match time limits.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Time budget</h3>
        <p className="text-gray-600 dark:text-gray-300">
          The time budget shows how much of each phase you've planned for. If you exceed the available time (shown in red), you'll need to reduce cycles or drop lower-priority strategies. Use this to validate that your plan is realistic.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Score projection</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Shows your estimated match score based on all non-defensive strategies. Use this to evaluate whether your strategy is competitive and identify where to focus improvements.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Defensive strategies</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Mark strategies as "defensive" if they don't directly score points (like blocking opponents). These are tracked separately and won't affect your score projection, but they still contribute to your time budget.
        </p>
      </section>
    </div>
  ),
}

export const retroHelp: HelpSection = {
  title: 'Retrospective Board',
  content: (
    <div className="space-y-4">
      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What is a retrospective?</h3>
        <p className="text-gray-600 dark:text-gray-300">
          A retrospective lets your team reflect on what went well, what needs improvement, and what actions to take next. It's a collaborative board where everyone can contribute items and vote on the ones they agree with most.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Two ways to view your retro</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Use the view toggle in the top-right of the toolbar to switch between two layouts. Both views show the exact same data—switching is instant and safe.
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li><strong>Column view</strong> — Groups items by sentiment (What Went Well, What Needs Improvement, etc.). Best for general retros and collecting broad feedback.</li>
          <li><strong>Topic view</strong> — Groups items by subsystem/topic (e.g. Drivetrain, Intake, Shooter). Within each topic, items are split into sentiment columns. Best for engineering-focused retros where you want to see each subsystem's strengths and weaknesses side by side.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Columns (sentiments)</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Columns represent the sentiment or purpose of an item. The board starts with three defaults, but you can customize them:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li><strong>What Went Well</strong> — Successes and strengths to keep doing</li>
          <li><strong>What Needs Improvement</strong> — Pain points and challenges to address</li>
          <li><strong>Action Items</strong> — Concrete next steps the team will take</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Click the <strong>Columns</strong> button (labeled <strong>Sentiments</strong> in Topic view) to add, rename, recolor, or delete columns. Columns can only be deleted when they have no items.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tags &amp; topics</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Tags and topics are the same thing—just viewed differently depending on which layout you're using:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
          <li>In <strong>Column view</strong>, they're called <strong>tags</strong> and appear as colored pills on each item. Use them to link related items across columns—click a tag to filter the board to only items with that tag.</li>
          <li>In <strong>Topic view</strong>, they're called <strong>topics</strong> and become the row headings (e.g. Drivetrain, Intake). Each topic section shows all its items split across sentiment columns.</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Click the <strong>Tags</strong> button (labeled <strong>Topics</strong> in Topic view) to manage your tag list. You can add multiple at once by separating with commas (e.g. "drivetrain, intake, shooter"). An item can have multiple tags—it will appear in each topic section it belongs to.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Adding &amp; editing items</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Click <strong>Add Item</strong> or the <strong>+</strong> button on a column header. Each item has a title, optional description, a column assignment (the sentiment), and optional tags. You can edit or delete items by hovering over them and clicking the pencil or trash icons.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Voting</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Click the thumbs-up button on any item to upvote it. Click again to remove your vote. Each person can only vote once per item—no spamming! Items are automatically sorted by vote count so the most popular items rise to the top.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Collaborative use</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Everyone in the same session sees the same board. Share the QR code so the whole team can add items and vote simultaneously from their own devices. Instead of duplicating ideas, upvote ones you agree with!
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Export &amp; use elsewhere</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Use the Export button to save your full session data (including the retro board) as JSON. You can then use this to create issues, tickets, or action items in your team's project tracker (GitHub Issues, Jira, Azure DevOps, etc.). Importing a backup restores all retro data including items, columns, tags, and vote counts.
        </p>
      </section>
    </div>
  ),
}
