'use client';

import { siteConfig } from '@/lib/config';

interface SchemaMarkupProps {
  type?: 'organization' | 'website' | 'service' | 'article' | 'breadcrumb';
  data?: any;
}

export function SchemaMarkup({ type = 'organization', data }: SchemaMarkupProps) {
  const getSchema = () => {
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'AccountingService',
          name: siteConfig.name,
          description: siteConfig.description,
          url: siteConfig.url,
          logo: `${siteConfig.url}/images/logo.png`,
          image: `${siteConfig.url}/images/og-image.jpg`,
          telephone: siteConfig.links.phone,
          email: siteConfig.business.email,
          address: {
            '@type': 'PostalAddress',
            streetAddress: siteConfig.business.address.street,
            addressLocality: siteConfig.business.address.city,
            addressRegion: siteConfig.business.address.state,
            postalCode: siteConfig.business.address.zip,
            addressCountry: 'BR',
          },
          sameAs: [
            siteConfig.links.social.facebook,
            siteConfig.links.social.instagram,
            siteConfig.links.social.linkedin,
            siteConfig.links.social.youtube,
          ].filter(Boolean),
          serviceType: [
            'Contabilidade Empresarial',
            'Abertura de Empresa',
            'Planejamento Tributário',
            'Departamento Pessoal',
            'Consultoria Fiscal',
          ],
          areaServed: {
            '@type': 'Country',
            name: 'Brasil',
          },
          priceRange: '$$',
          openingHours: 'Mo-Fr 08:00-18:00',
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteConfig.name,
          description: siteConfig.description,
          url: siteConfig.url,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteConfig.url}/blog?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'service':
        return {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: data?.title || 'Serviços Contábeis',
          description: data?.description || 'Serviços completos de contabilidade empresarial',
          provider: {
            '@type': 'AccountingService',
            name: siteConfig.name,
            url: siteConfig.url,
          },
          areaServed: {
            '@type': 'Country',
            name: 'Brasil',
          },
          serviceType: data?.serviceType || 'Contabilidade',
          offers: data?.price ? {
            '@type': 'Offer',
            price: data.price.from,
            priceCurrency: 'BRL',
            priceSpecification: {
              '@type': 'PriceSpecification',
              price: data.price.from,
              priceCurrency: 'BRL',
              billingIncrement: data.price.period === 'mensal' ? 'P1M' : 'P1Y',
            },
          } : undefined,
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data?.title,
          description: data?.excerpt,
          author: {
            '@type': 'Person',
            name: data?.author || 'ContabilPro',
          },
          publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            logo: {
              '@type': 'ImageObject',
              url: `${siteConfig.url}/images/logo.png`,
            },
          },
          datePublished: data?.publishedAt,
          dateModified: data?.updatedAt || data?.publishedAt,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteConfig.url}/blog/${data?.slug}`,
          },
          image: data?.image || `${siteConfig.url}/images/og-image.jpg`,
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data?.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${siteConfig.url}${item.href}`,
          })) || [],
        };

      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}

// Hook para gerar schema markup dinamicamente
export function useSchemaMarkup() {
  const generateServiceSchema = (service: any) => {
    return {
      title: service.title,
      description: service.description,
      serviceType: service.title,
      price: service.price,
    };
  };

  const generateArticleSchema = (article: any) => {
    return {
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      slug: article.slug,
      image: article.image,
    };
  };

  const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; href: string }>) => {
    return breadcrumbs;
  };

  return {
    generateServiceSchema,
    generateArticleSchema,
    generateBreadcrumbSchema,
  };
}