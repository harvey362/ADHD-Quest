import React from 'react';

const PreviewSection = () => {
  return (
    <section className="preview-section" id="preview">
      <div className="container">
        <h2 className="section-title mb-lg">
          [ DASHBOARD PREVIEW ]
        </h2>
        
        <div className="preview-window">
          <div className="preview-header">
            <span className="preview-dot"></span>
            <span className="preview-dot"></span>
            <span className="preview-dot"></span>
          </div>
          
          <div className="preview-content">
            <div className="preview-ascii">
{`╔════════════════════════════════════════════════════════╗
║  ADHD QUEST v0.1                    LEVEL: 42  XP: 8750 ║
╠════════════════════════════════════════════════════════╣
║                                                          ║
║  > ACTIVE QUEST: Clean the kitchen                      ║
║    ├─ [✓] Clear countertops         +10 XP              ║
║    ├─ [✓] Load dishwasher           +10 XP              ║
║    ├─ [ ] Wipe down surfaces        +10 XP              ║
║    └─ [ ] Sweep floor               +10 XP              ║
║                                                          ║
║  PROGRESS: ██████████░░░░░░░░  50%                      ║
║                                                          ║
║  ┌──────────────────┐  ┌──────────────────┐             ║
║  │  TASK MANAGER    │  │  FOCUS TIMER     │             ║
║  │  ────────────    │  │  ────────────    │             ║
║  │  [ NEW QUEST ]   │  │  [ 25:00 ]       │             ║
║  └──────────────────┘  └──────────────────┘             ║
║                                                          ║
║  [ EMERGENCY MODE ]  [ VIEW STATS ]  [ TOOLS ]          ║
║                                                          ║
╚════════════════════════════════════════════════════════╝`}
            </div>
            
            <div className="text-center mt-lg">
              <p className="feature-description">
                Your command center for conquering executive dysfunction.
                <br />
                Every task becomes a quest. Every completion, a victory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;
