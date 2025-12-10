# Overview

This project was done for the 🏠 Crowd Sourced City 2025: Civic Tech Prototyping, Housing Discrimination Edition class (11.458/11.138) taught by Professor Catherine D'Ignazio. 

This edition of Crowd Sourced City focuses on housing discrimination, and specifically on a partnership with the [Massachusetts Covenants Project](https://dusp.mit.edu/projects/massachusetts-covenants-project) and [MassHousing](https://www.masshousing.com/).

This was completed as a part of the Data Visualization team's deliverables, visualizing statistics about the Mass Covenants data to make it more legible for researchers.

## Description of deliverables 

Implemented here is:

A dashboard of statistics related to deed review: 
- Total number of system identified deeds: the number of deeds that have been marked as potentially containing a racial covenant through an automated process.
- Total number of manually confirmed deeds: the number of deeds that have been confirmed as containing a racial covenant by 2 or more human reviewers, with 0 conflicting reviews.
- Total number of pending deeds: the number of deeds with an incomplete deed review that has not indicated whether a deed has a racial covenant or not.
- Total number of deeds marked "review requested": the number of deeds that have manually been marked as needing additional review
- Total number of false positive deeds: the number of deeds that were marked as potentially having a racial covenant by the automated process but were then later confirmed to not contain a racial covenant by 2 human reviewers, with 0 conflicting reviews.

A bar chart of top grantors: 
- The top 20 most frequently mentioned deed grantors confirmed through manual review. Some similar entries were combined using regex, but some dupes may remain still. The chart is sorted by the number of distinct deeds that have mentioned each grantor.

A bar chart of top exclusion types: 
- The top 20 most frequently mentioned exclusion types confirmed through manual review. The chart is sorted by the number of distinct deeds that have mentioned each exclusion type.

A chart showing the timeline of exclusion types: 
- Allows for users to filter by county and by exclusion types to display how many distinct deeds with the selected fields were issued per year.

## Technicals

The backend uses Node.js and Express.js. It was reading from a local PostgreSQL database populated from a data dump of the Mass Covenants data.

The frontend uses React, [Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite), and recharts for data visualization.

## Next steps 

There is some additional code refactoring and cleanup that would be helpful (for e.g., making more React components reusable). There are also other proposed features and charts that could be implemented, like a download CSV option for filtered data. 
