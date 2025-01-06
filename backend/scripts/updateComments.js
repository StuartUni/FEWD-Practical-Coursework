require("dotenv").config();
const nedb = require("gray-nedb");
const { v4: uuidv4 } = require("uuid");

const conf = new nedb({ filename: process.env.CONF_FILE_PATH, autoload: true });

// Function to update comments with unique IDs
async function updateComments() {
    try {
        // Find all talks
        conf.find({}, (err, talks) => {
            if (err) {
                console.error("Error fetching talks:", err);
                return;
            }

            talks.forEach((talk) => {
                if (talk.comments && Array.isArray(talk.comments)) {
                    // Update each comment to include a unique ID
                    talk.comments = talk.comments.map((comment) => ({
                        ...comment,
                        id: comment.id || uuidv4(), 
                    }));
                } else {
                    console.warn(`Talk ${talk.id} has no comments or comments is not an array.`);
                }

                // Update the talk with the modified comments array
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
    } catch (error) {
        console.error("An unexpected error occurred:", error);
    }
}

// Run the update
updateComments();