const mongoose = require('mongoose')
const DATABASE_NAME = 'reunion-assignment'
const CONNECTION_URL = `mongodb+srv://varun:90977@old-store.7hpcw.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection Successful');
}).catch((e) => {
    console.log(e);
})