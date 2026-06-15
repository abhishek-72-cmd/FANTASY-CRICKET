// const db =require('../db/db');

// const runFixtureAutomation =require('../../controllers/admin/Automation/runFixtureAutomation');

// // this is the test automation for the prematch automation, we can run 
// // this file independently to test the automation for a specific fixture by providing the fixture id in the query
// // just add the match number WHERE ID=70019
// (async()=>{

//   const [[fixture]] =
//     await db.query(`
//       SELECT *
//       FROM fixtures
//       WHERE id=70019
//     `);

//     console.log(`Running automation for fixture: ${fixture.id} - ${fixture.name} euuuuuuuuuuuuuuuuuuuuuu`);

//     if(!fixture){
//       console.error(`Fixture not found`);
//     }
//     else{
//   await runFixtureAutomation(fixture);
//     }
//   process.exit();

// })();