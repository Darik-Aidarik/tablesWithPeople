const { useState, useEffect } = React;

async function get_data_users() {
    let data = await fetch('https://dummyjson.com/users')
    .then(res => res.json());
    return data;
}

function cut_req_data(data) {
    console.log(`start cut_req_data`);
    let users = [];
    for (let i = 0; i < data['users'].length; i++) {
        users.push({
            id: data['users'][i]['id'],
            last_name: data['users'][i]['lastName'],
            first_name: data['users'][i]['firstName'],
            maiden_name: data['users'][i]['maidenName'],
            age: data['users'][i]['age'],
            gender: data['users'][i]['gender'],
            phone: data['users'][i]['phone'],
            email: data['users'][i]['email'],
            city: data['users'][i]['address']['city'],
            country: data['users'][i]['address']['country'],
            address: data['users'][i]['address'],
            height: data['users'][i]['height'],
            weight: data['users'][i]['weight'],
            image: data['users'][i]['image'],
        });
    }
    return { users };
}

function UserModal({ user, onClose }) {
    if (!user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="modal-header">
                    <img src={user.image} alt={`${user.first_name} ${user.last_name}`} className="modal-avatar" />
                    <h2>{user.last_name} {user.first_name} {user.maiden_name}</h2>
                </div>

                <div className="modal-body">
                    <div className="modal-row">
                        <span className="modal-label">Возраст:</span>
                        <span className="modal-value">{user.age} лет</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Рост:</span>
                        <span className="modal-value">{user.height} см</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Вес:</span>
                        <span className="modal-value">{user.weight} кг</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Телефон:</span>
                        <span className="modal-value">{user.phone}</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Email:</span>
                        <span className="modal-value">{user.email}</span>
                    </div>
                    
                    <h3>Адрес</h3>
                    <div className="modal-row">
                        <span className="modal-label">Страна:</span>
                        <span className="modal-value">{user.address.country}</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Город:</span>
                        <span className="modal-value">{user.address.city}</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Адрес:</span>
                        <span className="modal-value">{user.address.address}</span>
                    </div>
                    
                    <div className="modal-row">
                        <span className="modal-label">Почтовый индекс:</span>
                        <span className="modal-value">{user.address.postalCode}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [originalUsers, setOriginalUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ field: null, order: 'none' });

    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({
        last_name: '',
        first_name: '',
        maiden_name: '',
        age: '',
        gender: '',
        phone: ''
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await get_data_users();
                const reqData = cut_req_data(data);
                setUsers(reqData.users);
                setOriginalUsers(reqData.users);
                setLoading(false);
            } catch (error) {
                console.error("Ошибка загрузки данных", error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <h1>Загрузка...</h1>;
    }

    const handleSort = (field) => {
        let newOrder = 'asc';
        
        if (sortConfig.field === field) {
            if (sortConfig.order === 'asc') {
                newOrder = 'desc';
            } else if (sortConfig.order === 'desc') {
                newOrder = 'none';
            }
        }

        setSortConfig({ field: field, order: newOrder });

        let sortedUsers = [];

        if (newOrder === 'none') {
            sortedUsers = [...originalUsers];
        } else {
            sortedUsers = [...users].sort((a, b) => {
                if (typeof a[field] === 'number' && typeof b[field] === 'number') {
                    return newOrder === 'asc' ? a[field] - b[field] : b[field] - a[field];
                }
                
                const aValue = String(a[field]).toLowerCase();
                const bValue = String(b[field]).toLowerCase();
                
                if (newOrder === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                } else {
                    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                }
            });
        }

        setUsers(sortedUsers);
    };

    const getSortIndicator = (field) => {
        if (sortConfig.field !== field) return '';
        if (sortConfig.order === 'asc') return ' ↑';
        if (sortConfig.order === 'desc') return ' ↓';
        return '';
    };

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            last_name: '',
            first_name: '',
            maiden_name: '',
            age: '',
            gender: '',
            phone: ''
        });
        setCurrentPage(1);
    };

    const filteredUsers = users.filter(user => {
        return (
            user.last_name.toLowerCase().includes(filters.last_name.toLowerCase()) &&
            user.first_name.toLowerCase().includes(filters.first_name.toLowerCase()) &&
            user.maiden_name.toLowerCase().includes(filters.maiden_name.toLowerCase()) &&
            (filters.age === '' || user.age.toString().includes(filters.age)) &&
            (filters.gender === '' || user.gender === filters.gender) &&
            user.phone.includes(filters.phone)
        );
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleRowClick = (user) => {
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    const uniqueGenders = [...new Set(originalUsers.map(user => user.gender))];

    return (
        <div>
            <h1>Список пользователей</h1>
            
            <div className="filters-container">
                <h3>Фильтрация</h3>
                <div className="filters-grid">
                    <div className="filter-item">
                        <label>Фамилия:</label>
                        <input
                            type="text"
                            placeholder="Введите фамилию"
                            value={filters.last_name}
                            onChange={(e) => handleFilterChange('last_name', e.target.value)}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Имя:</label>
                        <input
                            type="text"
                            placeholder="Введите имя"
                            value={filters.first_name}
                            onChange={(e) => handleFilterChange('first_name', e.target.value)}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Отчество:</label>
                        <input
                            type="text"
                            placeholder="Введите отчество"
                            value={filters.maiden_name}
                            onChange={(e) => handleFilterChange('maiden_name', e.target.value)}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Возраст:</label>
                        <input
                            type="number"
                            placeholder="Введите возраст"
                            value={filters.age}
                            onChange={(e) => handleFilterChange('age', e.target.value)}
                        />
                    </div>

                    <div className="filter-item">
                        <label>Пол:</label>
                        <select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                        >
                            <option value="">Все</option>
                            {uniqueGenders.map(gender => (
                                <option key={gender} value={gender}>
                                    {gender === 'male' ? 'Мужской' : 'Женский'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label>Телефон:</label>
                        <input
                            type="text"
                            placeholder="Введите телефон"
                            value={filters.phone}
                            onChange={(e) => handleFilterChange('phone', e.target.value)}
                        />
                    </div>
                </div>

                <button onClick={handleResetFilters} className="reset-btn">
                    Сбросить фильтры
                </button>

                <div className="filter-info">
                    Найдено: {filteredUsers.length} из {users.length}
                </div>
            </div>

            <table border="1">
                <thead>
                    <tr>
                        <th onClick={() => handleSort("last_name")}>
                            Фамилия{getSortIndicator("last_name")}
                        </th>
                        <th onClick={() => handleSort("first_name")}>
                            Имя{getSortIndicator("first_name")}
                        </th>
                        <th onClick={() => handleSort("maiden_name")}>
                            Отчество{getSortIndicator("maiden_name")}
                        </th>
                        <th onClick={() => handleSort("age")}>
                            Возраст{getSortIndicator("age")}
                        </th>
                        <th onClick={() => handleSort("gender")}>
                            Пол{getSortIndicator("gender")}
                        </th>
                        <th onClick={() => handleSort("phone")}>
                            Номер телефона{getSortIndicator("phone")}
                        </th>
                        <th onClick={() => handleSort("email")}>
                            Email{getSortIndicator("email")}
                        </th>
                        <th onClick={() => handleSort("country")}>
                            Страна{getSortIndicator("country")}
                        </th>
                        <th onClick={() => handleSort("city")}>
                            Город{getSortIndicator("city")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                            <tr 
                                key={user.id} 
                                onClick={() => handleRowClick(user)}
                                className="table-row-clickable"
                            >
                                <td>{user.last_name}</td>
                                <td>{user.first_name}</td>
                                <td>{user.maiden_name}</td>
                                <td>{user.age}</td>
                                <td>{user.gender === 'male' ? 'Мужской' : 'Женский'}</td>
                                <td>{user.phone}</td>
                                <td>{user.email}</td>
                                <td>{user.country}</td>
                                <td>{user.city}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="no-results">
                                Нет результатов
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {filteredUsers.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        Назад
                    </button>

                    <div className="pagination-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={currentPage === number ? 'active' : ''}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        Вперед
                    </button>
                </div>
            )}

            <div className="pagination-info">
                Страница {currentPage} из {totalPages}
            </div>

            <UserModal user={selectedUser} onClose={closeModal} />
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));