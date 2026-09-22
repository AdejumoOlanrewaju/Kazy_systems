const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: "Kayzee Global Computer Networks",
    description: "Laptop sales and repair services in Nigeria",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Tech Street, Allen Avenue", // update to your real address
      addressLocality: "Ikeja",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    telephone: "+234XXXXXXXXXX", // update to your real number
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "18:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default LocalBusinessSchema;