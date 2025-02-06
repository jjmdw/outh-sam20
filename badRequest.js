// constants
let CMS_TEXT_KEY_STR = 'data-cms-key';
let CMS_INNERHTML_KEY = 'data-cms-innerHtml';

//If REDIRECT_URL exists, redirect without showing SGW page
if (typeof haloJspEnvVars.REDIRECT_URL_FOR_CLIENT !== 'undefined') {
  if (''.trim() != haloJspEnvVars.REDIRECT_URL_FOR_CLIENT) {
    window.location.href = haloJspEnvVars.REDIRECT_URL_FOR_CLIENT;
  }
}

window.addEventListener('DOMContentLoaded', function () {
  // call method to load json language
  getCmsJsonAndLoad();

  processFooter();
});

function isAdobeTaggingActivated() {
  return haloJspEnvVars.ACTIVATE_ADOBE_TAGGING_FOR_CLIENT === "Y";
}

function processFooter() {
  if (haloJspEnvVars.ACTIVATE_FOOTER_LINKS !== 'N' && haloJspEnvVars.MIN_LOGIN !== "Y") {
    populatePolicyArea();
  } else {
    if (haloJspEnvVars.MIN_LOGIN === "Y") {
      return;
    }

    var policyAreaEl = document.getElementById('policyArea');
    if (policyAreaEl) {
      policyAreaEl.className += ' noLinks';
    }

    if (haloJspEnvVars.ACTIVATE_IP_MARKING != "N") {
      var copyrightEl = document.getElementById('copyright');
      if (copyrightEl) {
        copyrightEl.className += ' noLinks';
      }
    }
  }
}

// base64 encoded ascii to ucs-2 string
function decodeBase64(str) {
  if (str !== undefined && str !== null) {
    return decodeURIComponent(escape(window.atob(str)));
  } else {
    return '';
  }
}

function getFooterLinkArray() {
  let decodedString;
  let footerLinkArray;
  if (haloJspEnvVars.BROWSER_LANG === 'es') {
    decodedString = decodeBase64(haloJspEnvVars.ES_FOOTER_LINKS);
  } else {
    decodedString = decodeBase64(haloJspEnvVars.EN_FOOTER_LINKS);
  }

  if (decodedString !== '') {
    try {
      footerLinkArray = JSON.parse(decodedString);
    } catch (e) {
      console.log('Unable to parse JSON for footer link array. Setting to empty array. Error: ', e);
      console.log('decoded string: ', decodedString);
      footerLinkArray = [];
    }
  }
  return footerLinkArray;
}

function populatePolicyArea() {
  let policyAreaEl = document.getElementById('policyArea');
  if (policyAreaEl) {
    // continue
  } else {
    // policy area doesn't exist
    return;
  }

  let footerLinkArray = getFooterLinkArray();
  let arrayLength = footerLinkArray.length;

  for (let i = 0; i < arrayLength; i++) {
    let footerLinkObj = footerLinkArray[i];
    let footerLinkDivEl = getFooterLinkDivHtml(i);
    let footerLinkEl = getFooterLinkObjAnchorHtml(footerLinkObj, i);

    let footerLinkIconPhEl = null;
    let isIconPresentVal = isIconPresent(footerLinkObj);
    let isIconLeftVal = null;
    if (isIconPresentVal) {
      isIconLeftVal = isIconLeft(footerLinkObj);
      footerLinkIconPhEl = document.createElement('div');
      footerLinkIconPhEl.setAttribute('id', 'footerLinkIconPhEl' + i);

      let footerLinkElClass = footerLinkEl.getAttribute('class');
      // icon is on the left side of link, so add to dom now
      if (isIconLeftVal) {
        // append before link so it is on the left
        footerLinkDivEl.appendChild(footerLinkIconPhEl);

        // add margin for left icon
        footerLinkEl.setAttribute('class', footerLinkElClass + ' mar-l8');
      } else {
        // add margin for right icon
        footerLinkEl.setAttribute('class', footerLinkElClass + ' mar-r8');
      }
    }

    footerLinkDivEl.appendChild(footerLinkEl);

    // add icon to right side
    if (isIconPresentVal && !isIconLeftVal) {
      footerLinkDivEl.appendChild(footerLinkIconPhEl);
    }

    policyAreaEl.appendChild(footerLinkDivEl);

    // try to add icon now after dom has element
    if (isIconPresentVal) {
      getAndSetFooterLinkIconHtml(footerLinkObj, i);
    }
  }
}

function getFooterLinkDivHtml(index) {
  let footerLinkDiv = document.createElement('div');
  footerLinkDiv.setAttribute('id', 'footerLinkDiv' + index);
  footerLinkDiv.setAttribute('class', 'flex flex-row flex-items-center');

  return footerLinkDiv;
}

function getFooterLinkObjAnchorHtml(footerLinkObj, index) {
  let footerLinkEl = document.createElement('a');
  footerLinkEl.setAttribute('href', footerLinkObj.linkURL);
  footerLinkEl.setAttribute('id', 'footerLink' + index);
  footerLinkEl.setAttribute('class', 'footer-link-text');
  footerLinkEl.setAttribute('rel', 'noopener noreferrer');
  footerLinkEl.setAttribute('target', '_blank');
  footerLinkEl.textContent = footerLinkObj.linkLabel;

  return footerLinkEl;
}

function isIconPresent(footerLinkObj) {
  let linkIcon = footerLinkObj.linkIcon;
  return linkIcon != null && linkIcon != undefined && linkIcon != '';
}

function isIconLeft(footerLinkObj) {
  return (
    footerLinkObj.linkIconLocation === 'left' ||
    footerLinkObj.linkIconLocation === ''
  );
}

function getAndSetFooterLinkIconHtml(footerLinkObj, index) {
  let isIconSvgVal = isIconSvg(footerLinkObj);
  let iconPath = getIconGeneratedPath(footerLinkObj);

  let iconPlaceholderEl = document.getElementById('footerLinkIconPhEl' + index);
  if (isIconSvgVal) {
    // get svg icon and add to element
    getSvg(iconPath, function (status, response) {

      if (null !== response) {
        let svgIcon = response;
        let svgIconDiv = document.createElement('div');
        svgIconDiv.innerHTML = svgIcon;

        let svgIconHtml = svgIconDiv.firstChild;
        svgIconHtml.setAttribute('role', 'img');
        svgIconHtml.setAttribute('focusable', 'true');
        svgIconHtml.setAttribute('class', 'footer-link-icon-svg');
        svgIconHtml.setAttribute('id', 'footerLinkIconSvg' + index);

        // if alt text exists or is empty string, don't set if undefined
        if (footerLinkObj.linkIconAltText || footerLinkObj.linkIconAltText === '') {
          svgIconHtml.setAttribute('aria-label', footerLinkObj.linkIconAltText);
        }

        let footerLinkIconEl = document.createElement('div');
        footerLinkIconEl.setAttribute('id', 'footerLinkIcon' + index);
        footerLinkIconEl.setAttribute('class', 'flex flex-row flex-items-center footer-link-icon');
        footerLinkIconEl.appendChild(svgIconHtml);

        if (iconPlaceholderEl) {
          iconPlaceholderEl.replaceWith(footerLinkIconEl);
        }
      }
    });

  } else {
    // create image tag for non-svg icons
    let footerLinkIconEl = document.createElement('img');
    footerLinkIconEl.setAttribute('id', 'footerLinkIcon' + index);
    footerLinkIconEl.setAttribute('class', 'footer-link-icon');
    footerLinkIconEl.setAttribute('src', iconPath);

    if (footerLinkObj.linkIconAltText || footerLinkObj.linkIconAltText === '') {
      footerLinkIconEl.setAttribute('alt', footerLinkObj.linkIconAltText);
    }

    if (iconPlaceholderEl) {
      iconPlaceholderEl.replaceWith(footerLinkIconEl);
    }
  }
}

function isIconSvg(footerLinkObj) {
  return getFileExtension(footerLinkObj.linkIcon) === 'svg';
}

function getFileExtension(fileName) {
  if (isStringEmpty(fileName)) {
    return '';
  }

  const length = fileName.length;
  // get location of last . as extension should be after it
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === length) {
    // reached end of file, no extension
    return '';
  }

  const fileSubWithExt = fileName.substring(lastDotIndex + 1, length);

  // check if file/url had params
  const indexOfQues = fileSubWithExt.indexOf('?');
  if (indexOfQues > -1) {
    if (indexOfQues === 0) {
      // no extension before ?
      return '';
    } else {
      const ext = fileSubWithExt.substring(0, indexOfQues);
      return ext;
    }
  } else {
    return fileSubWithExt;
  }
}

function isStringEmpty(string) {
  return string == null || string == undefined || string === '';
}

function getIconPathType(footerLinkObj) {
  const iconPath = footerLinkObj.linkIcon;
  if (iconPath.startsWith('https://') || iconPath.startsWith('http://')) {
    return 'url';
  } else {
    return 'file';
  }
}

function getIconGeneratedPath(footerLinkObj) {
  if (this.getIconPathType(footerLinkObj) === 'url') {
    return footerLinkObj.linkIcon;
  } else {
    // if icon is just filename, get from CMS folder location
    return haloJspEnvVars.CMS_SGW_IMG_URL + footerLinkObj.linkIcon;
  }
}

var getSvg = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'text';
  xhr.onload = function () {
    var status = xhr.status;
    var response = xhr.response;
    if (status === 200) {
      callback(null, response);
    } else {
      callback(status, response);
    }
  };
  xhr.send();
};

/**
 * Helper method to get json file
 * @param {string} url url to load json from
 * @param {function} callback function to call after url loaded
 */
var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    var response = xhr.response;
    if (status === 200) {
      if (typeof (response) === 'string') {
        // Internet Explorer(legacy) response is not json, parse it
        response = JSON.parse(response);
      }
      callback(null, response);
    } else {
      callback(status, response);
    }
  };
  xhr.send();
};

/**
 * Get the cms url for language and load json, populate text on page
 */
function getCmsJsonAndLoad() {
  // get json for language, using cms prop url

  // get url from props
  let cmsUrl = haloJspEnvVars.CMS_SGW_TEXT_URL;
  cmsUrl = cmsUrl.replace('{lang}', haloJspEnvVars.BROWSER_LANG);
  getJSON(cmsUrl, function (status, response) {

    if (null !== response) {
      populateTextOnPage(response);
    }
  });
}

/**
 * Find all cms elements on page, extract cms key, update the textContent to be cms text
 * @param {object} response json response with cms data
 * @returns nothing
 */
function populateTextOnPage(response) {
  if (undefined === response || null === response || typeof (response) != 'object') {
    return;
  }

  // find data keys in html to replace with key/value pair in json file
  let cmsElements = document.querySelectorAll('[' + CMS_TEXT_KEY_STR + ']');

  for (var i = 0; i < cmsElements.length; i++) {
    let cmsElement = cmsElements.item(i);
    let cmsText = getTextByKey(response, cmsElement.getAttribute(CMS_TEXT_KEY_STR));

    let useInnerHtml = false;
    let cmsInnerHtmlVal = cmsElement.getAttribute(CMS_INNERHTML_KEY);
    if ('true' === cmsInnerHtmlVal) {
      useInnerHtml = true;
    }

    // set cms text on element
    if (useInnerHtml) {
      cmsElement.innerHTML = cmsText;
    } else {
      cmsElement.textContent = cmsText;
    }
  }
  setupLinkOnPage();
}

/**
 * Search cms data object for key and return string
 * @param {object} data data to find key in
 * @param {string} key string of key
 * @returns cms text in data for key
 */
function getTextByKey(data, key) {
  if (null === data || undefined === data) {
    return '';
  }
  if ('' == key || null === key || undefined === key) {
    return '';
  }

  let searchData = data;
  // split the key to use for search
  let splitKeyArray = key.split(".");

  // use split key for search, ex. 'level1.level2'. would be data['level1']['level2']
  for (let i = 0; i < splitKeyArray.length; i++) {
    let splitKey = splitKeyArray[i];
    // store current level of search
    searchData = searchData[splitKey];
    if (undefined === searchData) {
      searchData = '';
      break;
    }
  }
  return searchData;
}

/**
 * find the link to start over and add the href from props
 */
function setupLinkOnPage() {
  let linkEl = document.getElementById('goHome');
  if (linkEl) {
    linkEl.href = haloJspEnvVars.CANCEL_URL;
  }
}

// window.docReady is implemented in adobe scripts
// fires when document is ready
// if adobe is disabled, docReady will never fire
window.docReady = function () {
  if (!isAdobeTaggingActivated()) {
    return;
  }
  setupPageVars();
  sendSignIntoDDO();
  sendOnLoadEventToDDO();
  addEventListenersToLinks();

  function setupPageVars() {
    ddo.disableAutoPageLoad();
    ddo.setVar('page.pageInfo.friendlyPageName', 'Common Login Error Pg');
    ddo.setVar('page.location.url', '/haloc/virtual/login/error');
    ddo.setVar('clientId', haloJspEnvVars.APPNAME);
    ddo.setVar('page.category.applicationName', 'Halo Consumer');
    ddo.setVar('page.pageInfo.flowCode', 'LGN');
    ddo.setVar('page.pageInfo.lineOfBusiness', 'General');
    ddo.setVar('page.pageInfo.viewedUIExperience', 'Desktop');
    ddo.setVar('page.pageInfo.responsiveWebDesignFlag', 1);
    ddo.setVar('page.pageInfo.language', haloJspEnvVars.BROWSER_LANG.toUpperCase());
    ddo.setVar('page.attributes.loginAppClientId', haloJspEnvVars.APPNAME);
    ddo.setVar('page.attributes.loginAppTransactionId', haloJspEnvVars.trID);
  };

  function sendOnLoadEventToDDO() {
    pushEvent('pageLoad', 'Page_Load');
  };

  function getLinkDataAndSend(event, data, position) {
    if (!data) {
      var target = event.currentTarget;
      data = {
        linkDestinationUrl: target.href,
        linkName: target.innerHTML,
        linkPosition: position
      };
    }
    sendLinkEventToDDO(data);
  };

  function sendLinkEventToDDO(data) {
    pushEvent('linkClick', 'Link_Click', data);
  };

  function pushEvent(eventAction, eventCode, additionalData) {
    if (!isAdobeTaggingActivated()) {
      return;
    }
    if (additionalData) {
      ddo.pushEvent(eventAction, eventCode, additionalData);
    } else {
      ddo.pushEvent(eventAction, eventCode);
    }
  };

  function sendSignIntoDDO() {
    const formSubmitData = {
      statusCode: 902,
      successFlag: 0,
      authenticationMethod: 'IPW',
      authenticationType: 'User',
      clientId: haloJspEnvVars.APPNAME,
      'page.pageInfo.flowCode': 'LGN',
      'page.attributes.loginAppClientId': haloJspEnvVars.APPNAME,
      'page.attributes.loginAppTransactionId': haloJspEnvVars.trID,
    };
    ddo.pushEvent('formResponse', 'Common_Login_Submit', formSubmitData);
  };

  function addEventListenersToLinks() {
    var goHomeEl = document.getElementById("goHome");

    if (goHomeEl) {
      goHomeEl.addEventListener("click", function (event) {
        var target = event.currentTarget;
        var data = {
          linkDestinationUrl: haloJspEnvVars.CANCEL_URL,
          linkName: target.innerHTML.trim(),
          linkPosition: 'Body'
        }
        getLinkDataAndSend(event, data, 'Body');
      });
    }

    if (haloJspEnvVars.MIN_LOGIN !== 'Y') {
      var footerLinks = document.getElementsByClassName('footer-link-text');
      if (footerLinks && footerLinks.length > 0) {
        for (var i = 0; i < footerLinks.length; i++) {
          footerLinks[i].addEventListener("click", function (event) {
            var target = event.currentTarget;
            var data = {
              linkDestinationUrl: target.href,
              linkName: target.innerHTML.trim(),
              linkPosition: 'Footer'
            }
            getLinkDataAndSend(event, data, 'Footer');
          });
        }
      }
    }
  }
}
