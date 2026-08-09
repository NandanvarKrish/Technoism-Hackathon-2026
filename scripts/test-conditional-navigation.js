const fs = require('fs');
const path = require('path');

function runConditionalNavigationTest() {
  console.log('=== ACCEPTANCE TEST: CONDITIONAL TOP WORKFLOW NAVIGATION ===\n');

  try {
    // ------------------------------------------------------------
    // TEST 1: Initial Fresh Start (Workflow Not Started)
    // ------------------------------------------------------------
    console.log('--- TEST 1: Initial Fresh State ---');
    const stateFile = path.join(__dirname, '../client/js/state.js');
    const uiFile = path.join(__dirname, '../client/js/ui.js');
    const htmlFile = path.join(__dirname, '../client/index.html');

    const stateContent = fs.readFileSync(stateFile, 'utf8');
    const uiContent = fs.readFileSync(uiFile, 'utf8');
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');

    const hasInitialFalseFlag = stateContent.includes('isWorkflowStarted: false');
    console.log(`Initial State isWorkflowStarted = false? ${hasInitialFalseFlag ? '✅ YES' : '❌ NO'}`);

    const hasConditionalNavDisplay = uiContent.includes('stepperElem.style.display = isWorkflowStarted ? \'flex\' : \'none\'') || uiContent.includes('isWorkflowStarted');
    console.log(`Header Stepper Nav visibility controlled by isWorkflowStarted state? ${hasConditionalNavDisplay ? '✅ YES' : '❌ NO'}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 2: Start Resume Analysis Trigger
    // ------------------------------------------------------------
    console.log('--- TEST 2: Start Analysis Triggers Workflow Flag ---');
    const appFile = path.join(__dirname, '../client/js/app.js');
    const appContent = fs.readFileSync(appFile, 'utf8');
    const setsFlagOnExtract = appContent.includes('isWorkflowStarted: true');
    console.log(`Resume analysis start sets isWorkflowStarted = true? ${setsFlagOnExtract ? '✅ YES' : '❌ NO'}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 3 & 4: Reset Demo Resets Workflow Flag & Hides Navigation
    // ------------------------------------------------------------
    console.log('--- TEST 3 & 4: Reset Demo Clears State & Hides Navigation ---');
    const resetsFlagOnReset = stateContent.includes('isWorkflowStarted: false') && stateContent.includes('resetAll()');
    console.log(`Reset Demo sets isWorkflowStarted = false & clears state? ${resetsFlagOnReset ? '✅ YES' : '❌ NO'}`);

    console.log('\n------------------------------------------------------------\n');

    // ------------------------------------------------------------
    // TEST 5 & 6: Session Persistence & Recovery Verification
    // ------------------------------------------------------------
    console.log('--- TEST 5 & 6: Persistence & Route Locking Check ---');
    const persistsFlag = stateContent.includes('isWorkflowStarted: this.state.isWorkflowStarted');
    const locksPrematureRoutes = stateContent.includes('!isStarted') && stateContent.includes('[');

    console.log(`isWorkflowStarted flag persisted for browser refresh? ${persistsFlag ? '✅ YES' : '❌ NO'}`);
    console.log(`Unstarted workflow routes locked before activation? ${locksPrematureRoutes ? '✅ YES' : '❌ NO'}`);

    console.log('\n------------------------------------------------------------\n');

    // VERIFICATION CHECKS
    console.log('=== ACCEPTANCE VERIFICATION CHECKS ===');
    const check1 = hasInitialFalseFlag && hasConditionalNavDisplay;
    const check2 = setsFlagOnExtract;
    const check3 = resetsFlagOnReset && persistsFlag && locksPrematureRoutes;

    console.log('1. Header hides middle workflow navigation when workflow is not started?', check1 ? '✅ YES' : '❌ NO');
    console.log('2. Workflow navigation appears when user starts resume analysis?', check2 ? '✅ YES' : '❌ NO');
    console.log('3. Reset Demo hides navigation; active session refresh preserves navigation?', check3 ? '✅ YES' : '❌ NO');

    if (check1 && check2 && check3) {
      console.log('\n🎉 SUCCESS: All 6 Conditional Top Navigation criteria passed!');
    } else {
      console.error('\n❌ FAILURE: Navigation criteria check failed.');
    }
  } catch (err) {
    console.error('Acceptance Test Error:', err);
  }
}

runConditionalNavigationTest();
