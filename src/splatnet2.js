const request = require('request-promise-native');

const session_code = '';

async function getSessionToken(session_token_code, session_state) {
    const resp = await request({
        method: 'POST',
        uri: 'https://accounts.nintendo.com/connect/1.0.0/api/session_token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Platform': 'Android',
            'X-ProductVersion': '1.0.4',
            'User-Agent': 'com.nintendo.znca/1.0.4 (Android/4.4.2)',
            // 'User-Agent': 'OnlineLounge/1.0.4 NASDKAPI Android',
            // 'Accept': 'application/json',
            // 'Accept-Encoding': 'gzip',
            // 'Accept-Language': 'en-US',
        },
        form: {
            'client_id': '71b963c1b7b6d119',
            'session_token_code': session_token_code,
            'session_token_code_verifier': 'cca7dbb27d384c59516d52957de4c26907f596dce11856485f44a23d2620f638',
        },
    });

    return resp.session_token;
}

async function getApiToken(session_token) {
    const resp = await request({
        method: 'POST',
        uri: 'https://accounts.nintendo.com/connect/1.0.0/api/token',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Platform': 'Android',
            'X-ProductVersion': '1.0.4',
            'User-Agent': 'com.nintendo.znca/1.0.4 (Android/4.4.2)'
        },
        json: {
            'client_id': '71b963c1b7b6d119',
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token',
            'session_token': session_token,
        },
    });

    return resp.id_token;
}

async function getApiLogin(id_token) {
    const resp = await request({
        method: 'POST',
        uri: 'https://api-lp1.znc.srv.nintendo.net/v1/Account/Login',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Platform': 'Android',
            'X-ProductVersion': '1.0.4',
            'User-Agent': 'com.nintendo.znca/1.0.4 (Android/4.4.2)',
            'Authorization': 'Bearer',
        },
        body: {
            "parameter": {
                "language": "en-US",
                'naCountry': 'US',
                "naBirthday": "1980-08-22",
                "naIdToken": id_token
            }
        },
        json: true,
    });

    return resp.result.webApiServerCredential.accessToken;
}

async function getWebServiceToken(token) {
    const resp = await request({
        method: 'POST',
        uri: 'https://api-lp1.znc.srv.nintendo.net/v1/Game/GetWebServiceToken',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Platform': 'Android',
            'X-ProductVersion': '1.0.4',
            'User-Agent': 'com.nintendo.znca/1.0.4 (Android/4.4.2)',
            'Authorization': `Bearer ${token}`,
            // 'Access-Control-Allow-Origin': '*',
        },
        json: {
            "parameter": {
                "id": 5741031244955648, // SplatNet 2 ID
            }
        },
    });

    return {
        accessToken: resp.result.accessToken,
        expiresAt: Math.round((new Date()).getTime()) + resp.result.expiresIn,
    };
}

async function getSplatnetUrl(token) {
  const resp = await request({
      method: 'GET',
      uri: 'https://app.splatoon2.nintendo.net',
      headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Platform': 'Android',
          'X-ProductVersion': '1.0.4',
          'User-Agent': 'com.nintendo.znca/1.0.4 (Android/4.4.2)',
          'x-gamewebtoken': token,
          'x-isappanalyticsoptedin': false,
          'X-Requested-With': 'com.nintendo.znca',
      },
      qs: {
        lang: 'en-US',
      },
  });

  console.log(resp);
}

async function getCookie(token) {
    return request.cookie(`iksm_session=${token}`);
}

async function getSplatnetSession() {
  const idToken = await getApiToken(session_code);
  const apiAccessToken = await getApiLogin(idToken);
  const splatnetToken = await getWebServiceToken(apiAccessToken);
  return splatnetToken;
}
// getSplatnetSession();
module.exports = {
  getSplatnetSession,
  getSessionToken,
};