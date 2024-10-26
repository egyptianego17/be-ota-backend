import app from '../app.js';

/* Start the server */
const port = process.env.PORT || 3002

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
  })