const nedb = require("gray-nedb");

const conf = new nedb({ filename: "conf.db", autoload: true });

// Find all talks
conf.find({}, (err, talks) => {
    if (err) {
        console.error("Error fetching talks:", err);
        return;
    }
    // For each talk, update the comments array
    talks.forEach((talk) => {
        if (talk.comments && Array.isArray(talk.comments)) {
           
            talk.comments = talk.comments.map((comment) => ({
                ...comment,
                id: comment.id || new Date().getTime().toString() + Math.random().toString(36).substring(2, 7), 
            }));
        }

        // Update the talk with the new comments array
        conf.update(
            { id: talk.id },
            { $set: { comments: talk.comments } },
            {},
            (updateErr) => {
                if (updateErr) {
                    console.error(`Error updating talk ${talk.id}:`, updateErr);
                } else {
                    console.log(`Updated talk ${talk.id} with unique comment IDs.`);
                }
            }
        );
    });
});