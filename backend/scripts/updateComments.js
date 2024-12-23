// const confDAO = require("../models/confModel");
// const conf = new confDAO({ filename: "conf.db", autoload: true });

// const updateCommentsFormat = async () => {
//     try {
//         const talks = await conf.getAllEntries();
//         talks.forEach((talk) => {
//             if (talk.comments && Array.isArray(talk.comments)) {
//                 const updatedComments = talk.comments.map((comment) => {
//                     // Check if the old `userId` format exists and update it
//                     if (comment.userId && !comment.username) {
//                         return {
//                             username: `User ${comment.userId}`, // Assign placeholder username
//                             comment: comment.comment,
//                             timestamp: comment.timestamp,
//                         };
//                     }
//                     // Keep comments in the correct format
//                     return comment;
//                 });

//                 // Update the talk's comments in the database
//                 conf.conf.update(
//                     { id: talk.id },
//                     { $set: { comments: updatedComments } },
//                     {},
//                     (err) => {
//                         if (err) {
//                             console.error(`Failed to update comments for talk ID ${talk.id}:`, err);
//                         } else {
//                             console.log(`Comments updated for talk ID ${talk.id}`);
//                         }
//                     }
//                 );
//             }
//         });
//         console.log("Comments update script completed.");
//     } catch (err) {
//         console.error("Error updating comments format:", err);
//     }
// };

// updateCommentsFormat();

const nedb = require("gray-nedb");

const conf = new nedb({ filename: "conf.db", autoload: true });

// Fetch all talks
conf.find({}, (err, talks) => {
    if (err) {
        console.error("Error fetching talks:", err);
        return;
    }

    talks.forEach((talk) => {
        if (talk.comments && Array.isArray(talk.comments)) {
            // Add unique IDs to comments if they don't already have one
            talk.comments = talk.comments.map((comment) => ({
                ...comment,
                id: comment.id || new Date().getTime().toString() + Math.random().toString(36).substring(2, 7), // Unique ID
            }));
        }

        // Update the talk with updated comments in the database
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