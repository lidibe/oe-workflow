/*
©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary), Bangalore, India. All Rights Reserved.
*/

// date parse module.
// eslint radix:0

let utcDateFormatter = (function formatter() {
  var locale = 'en-US';
  /*eslint-disable */
  return Intl.DateTimeFormat(locale, {
    timeZone: 'UTC'
  });
  /* eslint-enable */
})();

let parse = function parse(date, inputFormat) {
  if (typeof date === 'undefined' || date.length < 4) {
    return;
  }
  inputFormat = (inputFormat && inputFormat.toUpperCase()) || 'UK';
  if (inputFormat.indexOf('DD') > inputFormat.indexOf('MM')) {
    inputFormat = 'US';
  }

  var resultDate;
  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // separators with date string;
  var separator = '-';

  // replacing all special characters with '-'; and if it contains month name then replace with standard integer value;
  date = date.toLowerCase();
  months.forEach(function eachMonth(d) {
    if (date.indexOf(d) > -1) {
      date = date.replace(d, months.indexOf(d) + 1);
    }
  });
  date = date.replace(/[^0-9]/g, separator);

  // check if the date is with or without delimiter.
  var withSeperator = (date.indexOf(separator) > -1);

  // if the date is without delimiter then it may be containing some alphabets.
  var isNan = (function nanCheck(d) {
    return isNaN(d);
  })(date);

  var length = date.length;
  var day = '';
  var month = '';
  var year = '';
  var dateString = '';

  // for US based date format.
  if (inputFormat === 'US') {
    // without any delimiter.
    if (!withSeperator && !isNan) {
      switch (length) {
        // if the length of date is 4 then first letter will be cosidered as month, second for day and rest two for year.
        case 4:
        {
          day = '0' + date.slice(1, 2);
          month = '0' + date.slice(0, 1);
          year = parseInt(date.slice(2, 4), 10) >= 70 ? '19' + date.slice(2, 4) : '20' + date.slice(2, 4);
          dateString = day + month + year;
          resultDate = _setDate(dateString);
          break;
        }

        // if the length of date is 5 or 7 then last two or four letters will be considered as year and first three letters will be checked against month and day eligibility. In case of confusion undefined will be returned.
        case 5:
        case 7:

          if (length === 5) {
            year = parseInt(date.slice(3, 5), 10) >= 70 ? '19' + date.slice(3, 5) : '20' + date.slice(3, 5);
          } else {
            year = date.slice(3, 7);
          }
          day = '00';
          month = '00';
          var a = parseInt(date.slice(0, 1), 10);
          var b = parseInt(date.slice(1, 2), 10);
          var c = parseInt(date.slice(2, 3), 10);
          var nextTwo = parseInt(date.slice(1, 3), 10);

          if (a >= 2 || (c === 0 && a !== 0) || b > 2) {
            month = '0' + date.slice(0, 1);
            day = date.slice(1, 3);
          } else if (a === 0) {
            month = date.slice(0, 2);
            day = '0' + date.slice(2, 3);
          } else if (a <= 3 && a !== 0 && b === 1 && c <= 2) {
            // conflict = true;
            break;
          } else {
            // conflict = true;
            break;
          }

          dateString = day + month + year;
          resultDate = _setDate(dateString);
          break;

          // if the length of date is 6 then first two letters will be cosidered as month, next two for day and rest two for year.
        case 6:
          day = date.slice(2, 4);
          month = date.slice(0, 2);
          year = parseInt(date.slice(4, 6), 10) >= 70 ? '19' + date.slice(4, 6) : '20' + date.slice(4, 6);
          dateString = day + month + year;
          resultDate = _setDate(dateString);
          break;

          // if the length of date is 8 then first two letters will be cosidered as month, next two for day and rest four for year.L
        case 8:
          dateString = date.slice(2, 4) + date.slice(0, 2) + date.slice(4, 8);
          resultDate = _setDate(dateString);
          break;

        default:
          break;
      }
    } else if (withSeperator && isNan) {
      var dateArray = _split(date, separator);
      var temp = dateArray[0];
      dateArray[0] = dateArray[1];
      dateArray[1] = temp;
      resultDate = _setDate(dateArray.join(''));
    }
  } else {
    // for non-US based dates.
    /*eslint-disable */
    if (!withSeperator && !isNan) {
    /* eslint-enable */
      switch (length) {
        // if the length of date is 4 then first letter will be considered as day, second for month and rest two for year.
        case 4:
          day = '0' + date.slice(0, 1);
          month = '0' + date.slice(1, 2);
          // if year is of length 2 then add a prefix of 19 if greater than 70 and add 20 if less than 70.
          year = parseInt(date.slice(2, 4), 10) >= 70 ? '19' + date.slice(2, 4) : '20' + date.slice(2, 4);
          dateString = day + month + year;
          resultDate = _setDate(dateString);
          break;

          // if the length of date is 5 or 7 then last two or four letters will be cosidered as year and first three letters will be checked against month and day eligibility. In case of confusion undefined will be returned.
        case 5:
        case 7:
          dateString = '';
          year = '';
          if (length === 5) {
            year = parseInt(date.slice(3, 5), 10) >= 70 ? '19' + date.slice(3, 5) : '20' + date.slice(3, 5);
          } else if (length === 7) {
            year = date.slice(3, 7);
          }
          day = '00';
          month = '00';
          a = parseInt(date.slice(0, 1), 10);
          b = parseInt(date.slice(1, 2), 10);
          c = parseInt(date.slice(2, 3), 10);
          nextTwo = parseInt(date.slice(1, 3), 10);

          if (a >= 4) {
            day = '0' + date.slice(0, 1);
            month = date.slice(1, 3);
          } else if (c === 0) {
            day = '0' + date.slice(0, 1);
            month = date.slice(1, 3);
          } else if (a <= 3 && a !== 0 && b === 1 && c <= 2) {
            // conflict = true;
            break;
          } else if (nextTwo > 12 || (a >= 0 && b >= 0 && c >= 1)) {
            day = date.slice(0, 2);
            month = '0' + date.slice(2, 3);
          } else {
            // conflict = true;
            break;
          }

          dateString = day + month + year;
          resultDate = _setDate(dateString);
          break;
          // if the length of date is 6 then first two letters will be cosidered as day, next two for month and rest two for year.
        case 6:
          day = date.slice(0, 2);
          month = date.slice(2, 4);
          // if year is of length 2 then add a prefix of 19 if greater than 70 and add 20 if less than 70.
          year = parseInt(date.slice(4, 6), 10) >= 70 ? '19' + date.slice(4, 6) : '20' + date.slice(4, 6);
          dateString = day + month + year;
          resultDate = _setDate(dateString);
          break;

          // if the length of date is 8 then first two letters will be cosidered as day, next two for month and rest four for year.
        case 8:
          dateString = date.slice(0, 2) + date.slice(2, 4) + date.slice(4, 8);
          resultDate = _setDate(dateString);
          break;

        default:
          break;
      }
    } else if (withSeperator && isNan) {
      // split the date with proper delimiter.
      dateArray = _split(date, separator);

      // set the date according to the given day,month and year.
      resultDate = _setDate(dateArray.join(''));
    }
  }

  // return parsed date object with appropriate date value.
  return resultDate;
};

let format = function format(date, format) {
  if (format === '') {
    return date;
  }
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var daysFull = ['Sunday', 'Monday', 'Tueday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (typeof date === 'number') {
    date = new Date(date);
  } else if (typeof date === 'string') {
    date = new Date(date);
  }
  if (format === 'l') {
    format = 'MM/DD/YYYY';
  }

  if (format.indexOf('MMM') >= 0) {
    month = parseInt(date.getUTCMonth(), 10);
    format = format.replace('MMM', months[month]);
  } else if (format.indexOf('MM') >= 0) {
    var month = parseInt(date.getUTCMonth() + 1, 10);
    if (month < 10) {
      format = format.replace('MM', '0' + month);
    } else {
      format = format.replace('MM', month);
    }
  } else if (format.indexOf('M') >= 0) {
    month = parseInt(date.getUTCMonth() + 1, 10);
    format = format.replace('M', month);
  }

  if (format.indexOf('DDD') >= 0) {
    var day = parseInt(date.getUTCDay(), 10);
    format = format.replace('DDD', days[day]);
  }
  if (format.indexOf('DD') >= 0) {
    var dayDate = parseInt(date.getUTCDate(), 10);
    if (dayDate < 10) {
      format = format.replace('DD', '0' + dayDate);
    } else {
      format = format.replace('DD', dayDate);
    }
  }
  if (format.indexOf('D') >= 0) {
    day = parseInt(date.getUTCDate(), 10);
    format = format.replace('D', day);
  }

  if (format.indexOf('dddd') >= 0) {
    day = parseInt(date.getUTCDay(), 10);
    format = format.replace('dddd', daysFull[day]);
  }

  if (format.indexOf('YYYY') >= 0) {
    var year = date.getUTCFullYear();
    format = format.replace('YYYY', year);
  } else if (format.indexOf('YY') >= 0) {
    year = date.getUTCFullYear().toString().slice(2, 4);
    format = format.replace('YY', year);
  } else if (format.indexOf('Y') >= 0) {
    year = date.getUTCFullYear();
    format = format.replace('Y', year);
  }

  return format;
};

// setdate sets the date. Accepts 8 character string in ddmmyyyy
function _setDate(date) {
  var result;
  if (date && date.length === 8 && !isNaN(date)) {
    var day = parseInt(date.slice(0, 2), 10);
    var month = parseInt(date.slice(2, 4), 10) - 1;
    var year = parseInt(date.slice(4, 8), 10);

    if (month >= 0 && month <= 11 && day > 0 && day <= 31) {
      // UTC
      result = new Date(Date.UTC(year, month, day));

      // if date is more than number of days in month, the month is incremented.
      if (result.getUTCMonth() !== month || result.getUTCFullYear() !== year) {
        /* eslint-disable */
        result = undefined;
        /* eslint-enable */
      }
    }
  }

  // return dateObject .
  return result;
}

// This function will return an array of values which can be interpreted as values of day,month and year for a given date.
function _split(date, separator) {
  var dateArray = [];
  dateArray = date.split(separator);

  // if year is in beginning
  if (dateArray[0].length === 4 && dateArray[2].length !== 4) {
    dateArray[1] = dateArray[1] && dateArray[1].length === 1 ? '0' + dateArray[1] : dateArray[1];
    dateArray[2] = dateArray[2] && dateArray[2].length === 1 ? '0' + dateArray[2] : dateArray[2];
    var temp = dateArray[0];
    dateArray[0] = dateArray[2];
    dateArray[2] = temp;
  } else {
    dateArray[0] = dateArray[0] && dateArray[0].length === 1 ? '0' + dateArray[0] : dateArray[0];
    dateArray[1] = dateArray[1] && dateArray[1].length === 1 ? '0' + dateArray[1] : dateArray[1];

    // if year is of length 2 then add a prefix of 19 if greater than 70 and add 20 if less than 70.
    dateArray[2] = (dateArray[2] && dateArray[2].length === 2) ? (parseInt(dateArray[2], 10) >= 70 ? '19' + dateArray[2] : '20' + dateArray[2]) : dateArray[2];
  }
  return dateArray;
}

function _parseDecimal(input) {
  if (!input || input.length === 0) {
    /*eslint-disable */
    return undefined;
      /* eslint-enable */
  }

  var tmp = input;

  var isInvalid = tmp.split('.').length > 2 || tmp.lastIndexOf('+') > 0 || tmp.lastIndexOf('-') > 0 || tmp.replace(
    /[\+\-0-9\.]/g, '').length > 0;
  if (isInvalid) {
    /*eslint-disable */
    return undefined;
    /* eslint-enable */
  }
  return parseFloat(tmp);
}

function _calcDate(mDate, tuInput, type) {
  var retDate;
  var topup = tuInput.length === 1 ? 1 : _parseDecimal(tuInput.slice(0, tuInput.length - 1));
  if (!isNaN(topup)) {
    retDate = new Date(mDate.getTime());
    switch (type) {
      case 'days':
        var newDay = retDate.getUTCDate() + topup;
        retDate.setUTCDate(newDay);
        break;

      case 'weeks':
        var newDay = retDate.getUTCDate() + 7 * topup; // eslint-disable-line no-redeclare
        retDate.setUTCDate(newDay);
        break;

      case 'months':
        var newMonth = retDate.getUTCMonth() + topup;
        retDate.setUTCMonth(newMonth);
        break;

      case 'quarters':
        var newMonth = retDate.getUTCMonth() + 3 * topup; // eslint-disable-line no-redeclare
        retDate.setUTCMonth(newMonth);
        break;

      case 'years':
        var newyear = retDate.getUTCFullYear() + topup;
        retDate.setUTCFullYear(newyear);
        break;

      default:
        break;
    }
  }
  return retDate;
}

let parseShorthand = function parseShorthand(input, format) {
  if (!input || input.trim().length === 0) {
    return '';
  }
  var tuInput = input.trim().toUpperCase();

  var retDate;

  // reference for date calculation is today in user's timezone
  // but represented as UTC.
  // i.e. if entering '1d' at 2AM IST on 5th. It should calculate 6th as the date.
  // but 6th 00:00:00Z in UTC timezone.
  var mDate = new Date();
  mDate = new Date(Date.UTC(mDate.getFullYear(), mDate.getMonth(), mDate.getDate()));

  if (tuInput === 'T' || tuInput === 'TOD' || tuInput === 'TODAY') {
    retDate = mDate;
  } else if (tuInput === 'TOM') {
    retDate = mDate.setUTCDate(mDate.getUTCDate() + 1);
  } else if (tuInput[tuInput.length - 1] === 'D') {
    retDate = _calcDate(mDate, tuInput, 'days');
  } else if (tuInput[tuInput.length - 1] === 'W') {
    retDate = _calcDate(mDate, tuInput, 'weeks');
  } else if (tuInput[tuInput.length - 1] === 'M') {
    retDate = _calcDate(mDate, tuInput, 'months');
  } else if (tuInput[tuInput.length - 1] === 'Q') {
    retDate = _calcDate(mDate, tuInput, 'quarters');
  } else if (tuInput[tuInput.length - 1] === 'Y') {
    retDate = _calcDate(mDate, tuInput, 'years');
  } else {
    retDate = parse(tuInput, format);
  }

  return retDate;
};

module.exports = {
  utcDateFormatter: utcDateFormatter,
  parse: parse,
  format: format,
  parseShorthand: parseShorthand
};
