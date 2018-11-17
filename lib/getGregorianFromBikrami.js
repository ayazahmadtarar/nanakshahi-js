const julian = require( 'julian' )
const months = require( 'months' )
const Calendar = require( 'kollavarsham/dist/calendar.js' )
const Celestial = require( 'kollavarsham/dist/celestial/index.js' )
const toUnicodeNum = require( './toUnicodeNum' )
const calendarNames = require( './calendarNames' )

const celestial = new Celestial( 'SuryaSiddhanta' ) // NOTICE: Suraj Sidhant is not used by current Punjab Jantris, Drik system is used
const calendar = new Calendar( celestial )

/**
 * Converts Bikrami Lunar Date into the Gregorian Calendar (Accuracy of plus or minus 1 day)
 * @param {!number} year Bikrami Year
 * @param {!number} year Bikrami Month
 * @param {!number} tithi Bikrami Tithi
 * @param {boolean} [paksh=false] Lunar Paksh. Default is Sudi, `true` for Vadi.
 * @return {Object} Gregorian Date
 * @example getGregorianFromBikrami( 1723, 9, 7 )
 */
function getGregorianFromBikrami( year, month, tithi, paksh = false ) {
  // Convert Bikrami Year into Saka
  let sakaYear = year - 135
  let monthNum = month - 1
  let tithiDay = tithi

  // If Paksh is Vadi, add 15 days to tithi
  let pakshName
  if ( paksh === true ) {
    pakshName = calendarNames.paksh.vadi
    tithiDay += 15
    // Use Purnimanta System
    if ( monthNum <= 0 ) {
      monthNum += 11
      sakaYear -= 1
    } else {
      monthNum -= 1
    }
  } else {
    pakshName = calendarNames.paksh.sudi
  }

  const kaliYear = Calendar.sakaToKali( sakaYear )
  const ahargana = calendar.kaliToAhargana( kaliYear, monthNum, tithiDay )

  const julianDay = Calendar.aharganaToJulianDay( ahargana )

  const gregorianDate = julian.toDate( julianDay )
  const julianDate = Calendar.julianDayToJulianDate( julianDay )

  // Pooranmashi
  let pooranmashi
  if ( paksh === false && tithi === 15 ) {
    pooranmashi = true
  } else {
    pooranmashi = false
  }

  const englishDate = {
    month,
    monthName: calendarNames.months.en[ month - 1 ],
    paksh: pakshName.en,
    tithi,
    year,
  }

  const punjabiDate = {
    month: toUnicodeNum( month ),
    monthName: calendarNames.months.pa[ month - 1 ],
    paksh: pakshName.pa,
    tithi: toUnicodeNum( tithi ),
    year: toUnicodeNum( year ),
  }

  // Lunar Date Obj
  const lunarDate = {
    ahargana,
    englishDate,
    punjabiDate,
    pooranmashi,
  }

  // Return Gregorian Obj
  let gregorian = { // eslint-disable-line prefer-const
    gregorianDate,
    julianDay,
    lunarDate,
  }

  if ( julianDay < 2361221 ) {
    gregorian.julianDate = {
      year: julianDate.year,
      month: julianDate.month,
      monthName: months[ julianDate.month - 1 ],
      date: julianDate.date,
    }
  }

  return gregorian
}

module.exports = getGregorianFromBikrami