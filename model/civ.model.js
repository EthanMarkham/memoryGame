//Square Schema
var civ = mongoose.Schema

var civSchema = new Schema({
    imagePath:{
        type:String,
        required:true
    },
    name: {
        type:String,
        required:true
    }
})

mongoose.model('square', civSchema)