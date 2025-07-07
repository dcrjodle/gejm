# TODO

## Enemy Movement Improvements

1. **Implement smooth trajectory navigation for enemies**
   - Enemies currently make sharp turns when changing direction to their target
   - Should implement curved/smooth navigation with momentum and turning radius
   - Enemies should gradually turn towards their goal rather than instantly snapping to new directions
   - Consider implementing steering behaviors (seek, arrive) for more natural movement

## UI/Input Issues

2. **Fix shooting when clicking UI buttons**
   - Currently clicking buttons in the UI also triggers shooting
   - Need to prevent click events from propagating to the game canvas when interacting with UI elements
   - Should only shoot when clicking on the game area, not on menus/buttons