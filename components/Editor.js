import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TextEditor({ initialValue, onChange }) {
  const [content, setContent] = useState(initialValue);

  // Update local state when initialValue changes
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleEditorChange = (newContent) => {
    setContent(newContent);
    onChange(newContent); // Notify parent of the change
  };

  return (
    <div>
      <Editor
        value={content} // Set the value of the editor
        apiKey='w9gru1neur09cju0jso9lj2kvl1xo8y3uv2xkzlquj0vnyi5'
        init={{
          plugins: [
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
          ],
          toolbar: 'undo redo | blocks fontfamily fontsizeinput forecolor backcolor | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
          content_style: `
            .tox-tinymce {
              z-index: 2000 !important; /* Ensure this is higher than the modal */
            }
          `,
          tinycomments_mode: 'embedded',
          tinycomments_author: 'Author name',
          mergetags_list: [
            { value: 'First.Name', title: 'First Name' },
            { value: 'Email', title: 'Email' },
          ],
          ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        }}
        onEditorChange={handleEditorChange} // Use the new handler
      />
    </div>
  );
}