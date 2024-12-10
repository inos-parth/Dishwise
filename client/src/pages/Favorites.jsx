import React, { useState } from 'react';
import './Favorites.css';

const Favorites = () => {
  const [favorites] = useState([
    {
      id: 1,
      name: 'Sample Restaurant 1',
      cuisine: 'Italian',
      image: 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=400&h=300&q=80'
    },
    {
      id: 2,
      name: 'Sample Restaurant 2',
      cuisine: 'Japanese',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&q=80'
    }
  ]);

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <h1>My Favorites</h1>
        <div className="favorites-grid">
          {favorites.map(restaurant => (
            <div key={restaurant.id} className="favorite-card">
              <img src={restaurant.image} alt={restaurant.name} />
              <div className="favorite-info">
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                <button className="remove-button">
                  <i className="fas fa-heart"></i> Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;