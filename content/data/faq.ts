// Source: client email, 2026-08-20 — "the real terms, plainly stated." Verbatim policy content,
// lightly tightened for the web (question headers, paragraph breaks) but no numbers or facts
// changed. This supersedes the shorter, summarised FAQ that used to live inline in app/faq/page.tsx.

export type FaqItem = {
  q: string;
  paragraphs?: string[];
  list?: string[];
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const faqCategories: FaqCategory[] = [
  {
    id: "ordering",
    title: "Ordering & availability",
    items: [
      {
        q: "How do I place an order?",
        paragraphs: [
          "Simply submit an online order request through our website with as much detail as possible.",
          "Tell us what you're looking for, your preferred date, design, flavours, quantity and any other requirements. We'll review your request and get back to you with the next steps.",
        ],
      },
      {
        q: "How far in advance should I order?",
        paragraphs: [
          "We recommend placing your order as early as possible, particularly for bespoke cakes and weddings.",
          "Our standard recommended lead time is 14 days, although earlier is always better for more detailed designs and larger celebrations.",
        ],
      },
      {
        q: "Do you accept last-minute orders?",
        paragraphs: [
          "Yes! We do accept last-minute orders where availability allows.",
          "Simply submit an online order request with your requirements and requested date, and we'll let you know if we're able to accommodate you.",
          "Last-minute availability is never guaranteed and depends on our production schedule and the complexity of your order.",
        ],
      },
      {
        q: "When is my order confirmed?",
        paragraphs: [
          "Submitting an order request does not automatically confirm your booking.",
          "We'll review your requirements, confirm availability, provide your quotation and advise you of the payment required to secure your date.",
          "Your order is only confirmed once payment has been received and acknowledged by OCD.",
        ],
      },
      {
        q: "Can I make changes after submitting my order request?",
        paragraphs: [
          "Yes, where possible.",
          "Changes depend on the stage of your order, availability and how close your event date is. Changes or additions after confirmation may result in additional charges.",
          "For wedding cakes, significant changes made close to the event may not always be possible.",
        ],
      },
    ],
  },
  {
    id: "cakes",
    title: "Cakes & bespoke designs",
    items: [
      {
        q: "What types of cakes do you offer?",
        paragraphs: [
          "We create bespoke celebration cakes, wedding cakes and standard cakes in a variety of sizes, flavours and designs.",
          "From elegant and understated to completely elaborate, each cake is created specifically for the occasion.",
        ],
      },
      {
        q: "What flavours do you offer?",
        paragraphs: ["Our flavour collection includes favourites such as:"],
        list: [
          "Belgian chocolate with chocolate ganache",
          "Vanilla bean with caramel ganache",
          "Lemon & blueberry with cream cheese",
          "Toasted nut with cream cheese",
          "Orange, almond & white chocolate",
          "Roasted nougat & white chocolate",
          "Salted caramel",
          "Raspberry & white chocolate",
          "Cookies & cream",
          "Red velvet",
          "Spiced carrot with pecan, walnut & cream cheese",
          "Fruit cake with cream cheese",
          "Matcha with white chocolate ganache",
          "Espresso with white chocolate & Biscoff",
        ],
      },
      {
        q: "Can I choose different flavours for different tiers?",
        paragraphs: ["Yes. For multi-tier and wedding cakes, you can select different flavours for different tiers, subject to availability."],
      },
      {
        q: "Do you offer bespoke cakes?",
        paragraphs: [
          "Absolutely. Bespoke cakes are created around your celebration, personality and vision.",
          "You can share your theme, colours, inspiration images, toppers and other design details with us, and we'll develop the cake around your requirements.",
        ],
      },
      {
        q: "Can I send inspiration images?",
        paragraphs: [
          "Yes — please do.",
          "Inspiration images, mood boards and colour palettes are incredibly helpful when developing a bespoke design. They allow us to understand the aesthetic, details and overall feeling you're looking for.",
        ],
      },
      {
        q: "Will my cake look exactly like my inspiration image?",
        paragraphs: [
          "Not necessarily. We use inspiration images as a guide to understand your vision, but every OCD cake is handmade.",
          "Slight variations in colour, texture, decoration and execution are therefore to be expected. Your finished cake will be uniquely yours.",
        ],
      },
      {
        q: "Are your cakes covered in fondant?",
        paragraphs: ["No. Our cakes are covered in white chocolate ganache, creating a smooth, luxurious finish beneath the final decoration."],
      },
      {
        q: "How are bespoke cakes priced?",
        paragraphs: [
          "Bespoke cakes are individually quoted based on the requirements of the design.",
          "Factors such as size, number of tiers, servings, detailing, decorative elements, toppers and overall complexity all contribute to the final price.",
          "Our published prices are starting prices for standard cakes. Bespoke designs are quoted individually.",
        ],
      },
    ],
  },
  {
    id: "weddings",
    title: "Weddings",
    items: [
      {
        q: "How do I book my wedding cake?",
        paragraphs: [
          "Start by submitting an online wedding cake order request through our website.",
          "Tell us about your wedding date, venue, guest numbers, preferred flavours, design vision and any additional requirements.",
          "We'll review your request and come back to you with the next steps and quotation.",
        ],
      },
      {
        q: "Do you offer wedding cake consultations?",
        paragraphs: [
          "No. OCD does not offer wedding cake consultations.",
          "Our online order-request process allows you to provide your wedding details, design inspiration, flavours, cake requirements and additional information upfront, allowing us to develop your quotation efficiently.",
        ],
      },
      {
        q: "Do you offer wedding cake tastings?",
        paragraphs: [
          "Yes. Tasting boxes are available for couples who would like to experience our flavours before finalising their wedding cake.",
          "Availability and options can be discussed when submitting your wedding order request.",
        ],
      },
      {
        q: "Can I have different flavours across my wedding cake?",
        paragraphs: [
          "Yes. Different flavours can be selected for different tiers, subject to availability.",
          "It's a wonderful way to give your guests a selection of OCD favourites.",
        ],
      },
      {
        q: "Can you create matching desserts for my wedding?",
        paragraphs: ["Yes. We can create a coordinated dessert experience to complement your wedding cake, including:"],
        list: [
          "Gourmet cupcakes",
          "French macarons",
          "Cake pops",
          "Cakesicles",
          "Decorated sugar cookies",
          "Dessert cups",
          "Cheesecakes",
          "Tartlets",
          "Other signature confections",
        ],
      },
      {
        q: "Can you create wedding favours?",
        paragraphs: ["Yes. Custom dessert favours and packaging can be incorporated into your wedding order, subject to the requirements of the design."],
      },
      {
        q: "How many people can your wedding cakes serve?",
        paragraphs: [
          "We offer a range of cake sizes and tier configurations, from intimate celebrations through to larger weddings.",
          "Serving quantities are guidelines, and we'll recommend a suitable size based on your guest numbers and design.",
        ],
      },
    ],
  },
  {
    id: "cupcakes",
    title: "Cupcakes & signature confections",
    items: [
      {
        q: "What else does OCD offer?",
        paragraphs: ["We're about much more than cake. Our Signature Confections include:"],
        list: [
          "Gourmet cupcakes with Swiss meringue buttercream",
          "Chocolate cake pops",
          "Chocolate cakesicles",
          "French macarons",
          "Decorated sugar cookies",
          "Orange & coconut squares",
          "Caramel & peppermint cups",
          "Belgian chocolate mousse",
          "Cheesecakes",
          "Individual cheesecakes",
          "Assorted tartlets",
          "English scones with strawberry compote & cream",
        ],
      },
      {
        q: "Can I order cupcakes without ordering a cake?",
        paragraphs: ["Of course. Our cupcakes and Signature Confections can be ordered as standalone treats, gifts, party favours, dessert-table additions or for celebrations of any kind."],
      },
      {
        q: "Can you create matching cupcakes and desserts for my theme?",
        paragraphs: ["Yes. Where possible, we can coordinate colours, themes and design elements across your cakes, cupcakes, macarons, cookies, cake pops and other confections."],
      },
    ],
  },
  {
    id: "dietary",
    title: "Dietary requirements",
    items: [
      {
        q: "Do you offer egg-free cakes?",
        paragraphs: ["Yes. We offer egg-free cake options. Please indicate this requirement when submitting your online order request so that we can advise you on the available options."],
      },
      {
        q: "Do you offer gluten-free cakes?",
        paragraphs: ["Yes. We offer gluten-free cake options. Please indicate this requirement when submitting your online order request so that we can advise you on the available options."],
      },
      {
        q: "Can you accommodate allergies and other dietary requirements?",
        paragraphs: [
          "We do our best to accommodate dietary requirements where possible. Please disclose all allergies and dietary requirements when submitting your order request.",
          "While we offer egg-free and gluten-free options, OCD cannot guarantee an entirely allergen-free production environment.",
        ],
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & collection",
    items: [
      {
        q: "Do you deliver?",
        paragraphs: ["Yes. We deliver throughout KwaZulu-Natal."],
      },
      {
        q: "How much does delivery cost?",
        paragraphs: ["Delivery is calculated according to the delivery location and requirements of your order. Your delivery fee will be quoted separately as part of your order."],
      },
      {
        q: "Do you deliver wedding cakes?",
        paragraphs: ["Yes. Wedding cake delivery and setup can be arranged for your venue. We'll confirm the delivery details, timing and applicable delivery fee as part of your wedding booking."],
      },
      {
        q: "Can I collect my cake?",
        paragraphs: ["Yes. Collection can be arranged where applicable. If you collect your cake, responsibility for safe transportation begins once the cake has been handed over to you."],
      },
      {
        q: "How should I transport my cake?",
        paragraphs: [
          "Keep the cake completely level and secure during transportation. We recommend placing the boxed cake on a non-slip surface on the floor of the vehicle, keeping the vehicle cool and driving directly to your destination.",
          "Avoid sudden braking, sharp turns and unnecessary stops.",
        ],
      },
    ],
  },
  {
    id: "cake-care",
    title: "Cake care",
    items: [
      {
        q: "How should I store my cake?",
        paragraphs: [
          "Unless otherwise advised, cakes should be refrigerated until they're ready to be displayed or served. Allow the cake to come to room temperature before serving.",
          "Our cakes are butter-based and can become dense when eaten cold. White chocolate ganache can also crack or crumble if a cake is cut while too cold.",
        ],
      },
      {
        q: "How should I serve my cake?",
        paragraphs: [
          "We recommend using a sturdy cake stand that is at least 5cm larger than the cake board.",
          "Decorative elements such as flowers and toppers should be removed before cutting and serving.",
        ],
      },
      {
        q: "Can I keep leftover cake?",
        paragraphs: ["Yes. Place leftover cake in an airtight container and refrigerate."],
      },
    ],
  },
  {
    id: "payments",
    title: "Payments, cancellations & credit vouchers",
    items: [
      {
        q: "What payment is required to confirm my order?",
        paragraphs: ["Full payment is required to confirm your order. Your order is not considered confirmed until payment has been received and acknowledged by OCD."],
      },
      {
        q: "Is my deposit refundable?",
        paragraphs: ["No. 50% of your payment serves as a non-refundable deposit."],
      },
      {
        q: "Do you offer cash refunds?",
        paragraphs: ["No. OCD does not issue cash refunds. Where applicable under our cancellation policy, an OCD Credit Voucher will be issued instead."],
      },
      {
        q: "What happens if I cancel a standard order?",
        paragraphs: ["For standard orders:"],
        list: [
          "8 days or more before collection/delivery: 50% of the total amount paid will be issued as an OCD Credit Voucher.",
          "4–7 days before collection/delivery: 25% of the total amount paid will be issued as an OCD Credit Voucher.",
          "0–3 days before collection/delivery: no credit voucher will be issued.",
          "No cash refunds are provided.",
        ],
      },
      {
        q: "What happens if I cancel a wedding order?",
        paragraphs: [
          "Wedding cancellations are subject to the cancellation terms applicable to your wedding booking. The amount credited depends on the notice provided before the wedding date.",
          "No cash refunds are issued.",
        ],
      },
      {
        q: "How long is an OCD Credit Voucher valid?",
        paragraphs: ["All OCD Credit Vouchers are valid for 36 months from the date of purchase. This applies to credit vouchers issued for both standard orders and wedding orders."],
      },
      {
        q: "Can I use my credit voucher on a future order?",
        paragraphs: ["Yes. Your OCD Credit Voucher may be redeemed against a future OCD order during its 36-month validity period, subject to the applicable terms and availability."],
      },
    ],
  },
];
