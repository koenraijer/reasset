# ReAsset

This is a web application built with SvelteKit for the purpose of multiasset rebalancing. It allows users to rebalance assets to their target allocations in a way that minimises the number of transactions. 

## Features

- Presets for common combinations of index funds
- 

## Algorithm

The algorithm adjusts asset values by performing the following steps:

1. It finds the difference between the desired and actual values of each asset. This helps identify which assets are over or under their target values.

2. It splits assets into two groups: those needing more funds (underweighted) and those with too much (overweighted). This categorization aids in determining where adjustments are needed.

3. It orders each group by how far they are from their target, from most to least. This prioritization ensures that the assets furthest from their target are addressed first.

4. It goes through these sorted groups to either add funds to the underweighted or remove from the overweighted, using available cash. This step adjusts the asset values closer to their targets.

5. It transfers funds directly between assets if one needs money and another has excess. This efficient transfer of funds can help speed up the rebalancing process.

6. The process is repeated until all assets are very close to their target. This iterative approach ensures that all assets are balanced according to their target values.

## Usage

Provide instructions on how to use the application.

## Contributing

Provide instructions on how contributors can help improve your project.

## License

Include information about the license.