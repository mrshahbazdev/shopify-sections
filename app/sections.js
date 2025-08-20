export const availableSections = [
  {
    id: "simple-banner",
    title: "Simple Banner",
    description: "A simple banner with a heading and a text.",
    type: "free",
    category: "Banners",
    previewImage: "https://burst.shopifycdn.com/photos/minimalist-flat-lay-of-a-home-office.jpg?width=1000",
    demoUrl: "#", // Yahan aap demo page ka link daal sakte hain
    liquidCode: `
      <div class="banner-section">
        <h2>{{ section.settings.heading }}</h2>
        <p>{{ section.settings.text }}</p>
      </div>
      {% schema %}
      {
        "name": "Simple Banner",
        "settings": [
          { "type": "text", "id": "heading", "label": "Heading", "default": "Welcome to our store" },
          { "type": "text", "id": "text", "label": "Text", "default": "Explore our new collection" }
        ],
        "presets": [{ "name": "Simple Banner" }]
      }
      {% endschema %}
    `,
  },
  {
    id: "testimonial",
    title: "Testimonial",
    description: "Showcase a customer testimonial with an author name.",
    type: "free",
    category: "Social Proof",
    previewImage: "https://burst.shopifycdn.com/photos/glowing-neon-sign-on-brick-wall.jpg?width=1000",
    demoUrl: "#",
    liquidCode: `
      <div class="testimonial-section" style="padding: 20px; border: 1px solid #eee; border-radius: 5px; text-align: center;">
        <blockquote>"{{ section.settings.quote }}"</blockquote>
        <cite>- {{ section.settings.author }}</cite>
      </div>
      {% schema %}
      {
        "name": "Testimonial",
        "settings": [
          { "type": "richtext", "id": "quote", "label": "Quote", "default": "<p>This is the best product I have ever used!</p>" },
          { "type": "text", "id": "author", "label": "Author", "default": "Happy Customer" }
        ],
        "presets": [{ "name": "Testimonial" }]
      }
      {% endschema %}
    `,
  },
  {
    id: "image-slider",
    title: "Premium Image Slider",
    description: "A premium slider to showcase multiple images.",
    type: "premium",
    category: "Images",
    previewImage: "https://burst.shopifycdn.com/photos/modern-office-scenery.jpg?width=1000",
    demoUrl: "#",
    liquidCode: `
      <p>This is a premium slider. Please upgrade to use.</p>
      {% schema %}
      {
        "name": "Premium Image Slider",
        "settings": [],
        "presets": [{ "name": "Premium Image Slider" }]
      }
      {% endschema %}
    `,
  },
];
