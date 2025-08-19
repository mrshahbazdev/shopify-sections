export const availableSections = [
  {
    id: "simple-banner",
    title: "Simple Banner",
    description: "A simple banner with a heading and a text.",
    type: "free",
    liquidCode: `
      <div class="banner-section">
        <h2>{{ section.settings.heading }}</h2>
        <p>{{ section.settings.text }}</p>
      </div>

      {% schema %}
      {
        "name": "Simple Banner",
        "target": "section",
        "settings": [
          {
            "type": "text",
            "id": "heading",
            "label": "Heading",
            "default": "Welcome to our store"
          },
          {
            "type": "text",
            "id": "text",
            "label": "Text",
            "default": "Explore our new collection"
          }
        ]
      }
      {% endschema %}
    `,
  },
  {
    id: "testimonial",
    title: "Testimonial",
    description: "Showcase a customer testimonial with an author name.",
    type: "free",
    liquidCode: `
      <div class="testimonial-section">
        <blockquote>"{{ section.settings.quote }}"</blockquote>
        <cite>- {{ section.settings.author }}</cite>
      </div>

      <style>
        .testimonial-section {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 5px;
          text-align: center;
        }
      </style>

      {% schema %}
      {
        "name": "Testimonial",
        "target": "section",
        "settings": [
          {
            "type": "richtext",
            "id": "quote",
            "label": "Quote",
            "default": "<p>This is the best product I have ever used!</p>"
          },
          {
            "type": "text",
            "id": "author",
            "label": "Author",
            "default": "Happy Customer"
          }
        ]
      }
      {% endschema %}
    `,
  },
  {
    id: "image-slider",
    title: "Premium Image Slider",
    description: "A premium slider to showcase multiple images.",
    type: "premium",
    liquidCode: `
      <p>This is a premium slider. Please upgrade to use.</p>
      {% schema %}
      {
        "name": "Premium Image Slider",
        "target": "section",
        "settings": []
      }
      {% endschema %}
    `,
  },
];
