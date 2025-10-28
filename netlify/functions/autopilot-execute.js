// Netlify Scheduled Function: Autopilot executor

exports.handler = async function () {
  try {
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:3000'
    const endpoint = `${siteUrl}/api/autopilot/execute`

    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    const data = await res.json().catch(() => ({}))

    console.log('Autopilot executed via Netlify function:', {
      status: res.status,
      ok: res.ok,
      endpoint,
      data,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, status: res.status, data }),
    }
  } catch (error) {
    console.error('Autopilot Netlify function error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(error) }),
    }
  }
}


