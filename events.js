const _ = require('lodash');

class EventSystem {
    constructor() {
        this.initializeDatabase();
        this.setupQuerySystem();
    }

    initializeDatabase() {
        // This is where we'll store our events data
        // For now, let's add some sample data
        this.events = [
            {
                id: 1,
                title: "Family NYE at Dallas BBQ",
                url: "https://nycnewyears.com/new-years-eve-at-dallas-bbq/",
                category: "Family Friendly",
                description: "Family-friendly NYE celebration",
                attributes: {
                    isFamily: true,
                    hasBallDrop: false,
                    isRooftop: false,
                    isCruise: false,
                    hasAlcohol: true,
                    hasNonAlcohol: true
                }
            }
            // Add more events here
        ];

        // Create indices
        this.indices = {
            byCategory: _.groupBy(this.events, 'category'),
            byAttribute: {
                family: this.events.filter(e => e.attributes.isFamily),
                ballDrop: this.events.filter(e => e.attributes.hasBallDrop),
                rooftop: this.events.filter(e => e.attributes.isRooftop),
                cruise: this.events.filter(e => e.attributes.isCruise)
            }
        };
    }

    setupQuerySystem() {
        this.templates = {
            family: (events) => `
Here are some family-friendly options for New Year's Eve:
${events.map(e => `
- ${e.title}
  ${e.url}
  * Includes soda/juice bar for minors and regular bar for 21+ *`).join('\n')}`,

            cruise: (events) => `
Here are our NYE cruise celebrations:
${events.map(e => `
- ${e.title}
  ${e.url}
  * Full dinner buffet included *`).join('\n')}`
        };

        this.queryPatterns = [
            {
                keywords: ['family', 'kid', 'children', 'all ages'],
                attribute: 'family',
                template: 'family'
            },
            {
                keywords: ['cruise', 'boat', 'yacht'],
                attribute: 'cruise',
                template: 'cruise'
            }
        ];
    }

    handleQuery(query) {
        const q = query.toLowerCase();
        
        // Find matching pattern
        const match = this.queryPatterns.find(pattern => 
            pattern.keywords.some(keyword => q.includes(keyword))
        );

        if (match) {
            const events = this.indices.byAttribute[match.attribute];
            return {
                type: match.attribute,
                events: events,
                response: this.templates[match.template](events)
            };
        }

        return {
            type: 'unknown',
            events: [],
            response: "I can help you find the perfect NYE event. Are you interested in any specific type of venue (family-friendly, cruise, rooftop, etc.)?"
        };
    }

    findByMultipleCriteria(criteria) {
        return this.events.filter(event => 
            Object.entries(criteria).every(([key, value]) => 
                event.attributes[key] === value
            )
        );
    }
}

module.exports = { EventSystem };
