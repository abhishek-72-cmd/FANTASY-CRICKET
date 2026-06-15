

const db = require('../../../config/db/db.js');



const generateCredits = require('./generateCredits');
const AutoCreateContests = require('../../../config/jobs/AutoCreateContests');
const activateMatchAutomation = require('./activateMatchAutomation');
const {getAutomationStatus} = require('./get&updateAutomationStatus ')


const runFixtureAutomation =
async (fixture) => {

  try{

    const [[settings]] =
      await db.query(`
        SELECT auto_mode
        FROM automation_settings
        LIMIT 1
      `);

    if(!settings?.auto_mode){

      console.log(
        `⏸ Automation disabled for fixture ${fixture.id}`
      );

      return;
    }

    console.log(
      `⚙️ Running automation for fixture ${fixture.id}`
    );

    /*
    STEP 1
    VERIFY BOTH TEAMS AVAILABLE
    */

    const [[team1]] =
      await db.query(`
        SELECT COUNT(*) total
        FROM players
        WHERE season_id=?
        AND team_id=?
      `,
      [
        fixture.season_id,
        fixture.localteam_id
      ]);

    const [[team2]] =
      await db.query(`
        SELECT COUNT(*) total
        FROM players
        WHERE season_id=?
        AND team_id=?
      `,
      [
        fixture.season_id,
        fixture.visitorteam_id
      ]);

    console.log(
      `📊 Team1 Players: ${team1.total}`
    );

    console.log(
      `📊 Team2 Players: ${team2.total}`
    );

    if(
      team1.total === 0 ||
      team2.total === 0
    ){

      console.log(
        `❌ Both teams not available. Skipping automation.`
      );

      return;
    }

    console.log(
      `✅ Both teams available`
    );

    /*
    STEP 2
    GENERATE CREDITS
    */

    const [[creditsExist]] =
      await db.query(`
        SELECT COUNT(*) total
        FROM players
        WHERE season_id=?
        AND team_id IN (?,?)
        AND credit_points > 0
      `,
      [
        fixture.season_id,
        fixture.localteam_id,
        fixture.visitorteam_id
      ]);

    if(creditsExist.total === 0){

      console.log(
        `🎯 Generating credits`
      );

      await generateCredits(
        fixture.id
      );

      console.log(
        `✅ Credits generated`
      );

    }
    else{

      console.log(
        `✅ Credits already generated`
      );

    }

    /*
    STEP 3
    CREATE CONTESTS
    */

    const [[contestExist]] =
      await db.query(`
        SELECT COUNT(*) total
        FROM contests
        WHERE match_id=?
      `,
      [
        fixture.id
      ]);

    if(contestExist.total === 0){

      console.log(
        `🏆 Creating default contests`
      );

      await AutoCreateContests(
        fixture.id
      );

      console.log(
        `✅ Contests created`
      );

    }
    else{

      console.log(
        `✅ Contests already exist`
      );

    }

    /*
    STEP 4
    ACTIVATE MATCH
    */

    const [[activated]] =
      await db.query(`
        SELECT is_activated
        FROM fixtures
        WHERE id=?
      `,
      [
        fixture.id
      ]);

    if(
      Number(
        activated.is_activated
      ) === 0
    ){

      console.log(
        `🚀 Activating match`
      );

      await activateMatchAutomation(
        fixture.id
      );

      console.log(
        `✅ Match activated`
      );

    }
    else{

      console.log(
        `✅ Match already activated`
      );

    }

    console.log(
      `🎉 Automation completed for fixture ${fixture.id}`
    );

  }
  catch(err){

    console.error(
      `❌ Automation failed for fixture ${fixture.id}`
    );

    console.error(
      err.message
    );

  }

};

module.exports = runFixtureAutomation;