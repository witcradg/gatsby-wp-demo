const path = require(`path`);

const limit = process.env.CITIES || 999999;

console.log('Cities pages limit is', limit);

exports.createPages = async ({ graphql, actions }) => {
    const { createPage, createSlice } = actions;
    const citiesTemplate = path.resolve(`src/templates/cities.js`);

    const result = await graphql(`
        query myQuery {
            allUsCitiesCsv {
                nodes {
                    city_varchar_25
                    county_varchar_21
                    id
                    lat_decimal_10_6
                    long_decimal_10_6
                    state_varchar_20
                    stateshort_varchar_2
                    zip_varchar_5
                }
            }
            allMarkdownRemark(
                filter: { frontmatter: { statename: { ne: null } } }
            ) {
                nodes {
                    html
                    frontmatter {
                        date
                        slug
                        statename
                        distribution
                        legalvideo
                        featuredImage {
                            childImageSharp {
                                gatsbyImageData
                            }
                            publicURL
                        }
                        image2 {
                            childImageSharp {
                                gatsbyImageData
                            }
                            publicURL
                        }
                        map
                        hhc_slug
                        legal_slug
                    }
                }
            }
        }
    `);

    createSlice({
        id: `header`,
        component: require.resolve(`./src/components/layout/header/header.js`)
    });

    createSlice({
        id: `footer`,
        component: require.resolve(`./src/components/layout/footer/footer.js`)
    });

    const stateDataArray = stripEmptyNodes(result.data.allMarkdownRemark.nodes);

    result.data.allUsCitiesCsv.nodes.every((node, index) => {
        if (index > limit) return false;

        const stateData = stateDataArray.find(
            (element) => element.frontmatter.statename === node.state_varchar_20
        );

        if (stateData) {
            const usState = node.state_varchar_20.toLowerCase();
            const usCity = node.city_varchar_25.toLowerCase();
            //work around
            let slug = `locations/${usState}/${usCity}/`.replace(/ /g, '-');
            createPage({
                path: slug,
                component: citiesTemplate,
                context: {
                    props: node,
                    stateData: stateData
                }
            });

            const citiesHHCTemplate = path.resolve(
                `src/templates/cities-hhc.js`
            );
            const tmp = slug.substring(0, slug.length - 1);
            const hhcSlug = `${tmp}-hhc-gummies`;
            createPage({
                path: hhcSlug,
                component: citiesHHCTemplate,
                context: {
                    props: node,
                    stateData: stateData
                }
            });
        }
        return true;
    });
};

function stripEmptyNodes(nodes) {
    const array = nodes.filter((node) => {
        if (node.frontmatter.statename !== null) {
            return true;
        }
        return false;
    });
    return array;
}

exports.createSchemaCustomization = ({ actions }) => {
    const { createTypes } = actions;
    const typeDefs = `
	  type MarkdownRemarkFrontmatter implements Node {
		component: String
		date: String
		text: String
		msgbar1: String
		msgbar2: String
		slug: String
		statename: String
        legalvideo: String
		map: String
		cardName: String
		crumbsPath: String
		crumbsLabel: String
		title: String
		productCardImageAlt: String
		discountedPrice: Float!
		originalPrice: Float
		displayedDiscount: String
        outOfStock: String
		productLink: String
		yotpoProductId: String
		descriptionTotalContent: String
		descriptionPotency: String
		descriptionCount: String
		reviewsProductId: String
		reviewsItemName: String
		dataItemId: String
		dataItemUrl: String
		dataItemDescription: String
		dataItemName: String
        seoTitle: String
        seoDescription: String
	  }
	`;
    createTypes(typeDefs);
};
