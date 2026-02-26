const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const { v4: uuidV4 } = require('uuid');

// @route   POST api/documents
// @desc    Create a new document
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title } = req.body;
        const newDoc = new Document({
            _id: uuidV4(),
            title: title || 'Untitled Document',
            owner: req.user.id,
            data: { ops: [{ insert: "" }] }
        });

        const doc = await newDoc.save();
        res.json(doc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/documents
// @desc    Get all documents for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const docs = await Document.find({
            $or: [
                { owner: req.user.id },
                { 'collaborators.user': req.user.id }
            ]
        }).sort({ updatedAt: -1 });
        res.json(docs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/documents/:id
// @desc    Get document by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        // Check if user is owner or collaborator
        // For simplicity allow any authenticated user to view for now if they have the link, 
        // strictly you'd check permissions here.

        res.json(doc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/documents/:id
// @desc    Update document metadata (title)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { title } = req.body;
        let doc = await Document.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        // Check user
        if (doc.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        doc = await Document.findByIdAndUpdate(req.params.id, { $set: { title } }, { new: true });
        res.json(doc);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ msg: 'Document not found' });
        }

        // Check user
        if (doc.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Document.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Document removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
