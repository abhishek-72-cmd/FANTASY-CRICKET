const express = require('express');
const db = require('../../../../config/db/db');

const getFixtures = async (req, res) => {
  try {
    const [fixtures] = await db.query(`SELECT 
    f.*, 
     f.is_activated AS is_activated,
    lt.name AS localteam_name, 
    lt.code AS localteam_code,
    lt.image_path AS localteam_image,
    vt.name AS visitorteam_name, 
    vt.code AS visitorteam_code,
    vt.image_path AS visitorteam_image
FROM fixtures f
JOIN teams lt ON f.localteam_id = lt.id
JOIN teams vt ON f.visitorteam_id = vt.id
WHERE f.starting_at > NOW()
ORDER BY f.starting_at ASC`);

    res.status(200).json({
      success: true,
      data: fixtures,
    });

    // console.log ('Fetched fixtures: ', fixtures);
  } catch (err) {
    console.error('Error fetching fixtures: ', err.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching fixtures',
      error: err.message,
    });
  }
};

module.exports = getFixtures;
