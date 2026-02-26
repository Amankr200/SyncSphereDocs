const mongoose = require("mongoose")

const DocumentSchema = new mongoose.Schema({
    _id: String, // UUID from client
    title: {
        type: String,
        default: "Untitled Document"
    },
    data: Object, // The Delta object
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // We can track specific user permissions, but for "Link Sharing" features 
    // like Google Docs (Anyone with link can View/Edit), we often use a simpler flag
    // on the document itself.
    shareMode: {
        type: String,
        enum: ['restricted', 'view', 'edit'], // restricted=only collaborators, view=anyone with link can view, edit=anyone with link can edit
        default: 'edit' // Default to edit for simplicity in this demo, usually 'restricted' is safer
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['editor', 'viewer'],
            default: 'editor'
        }
    }],
    version: {
        type: Number,
        default: 1
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Document", DocumentSchema)
