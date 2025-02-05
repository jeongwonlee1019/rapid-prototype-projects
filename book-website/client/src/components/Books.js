import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import './Books.css';

function Books() {
    const [search, setSearch] = useState("");
    const [searchType, setSearchType] = useState("title");
    const [books, setBooks] = useState([]);

    const searchBook = () => {
        let query;
        if (searchType === "author") {
            query = `inauthor:${search}`;
        } else if (searchType === "isbn") {
            query = `isbn:${search}`;
        } else {
            query = search;
        }

        axios
            .get(
                `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyCfEXLtShFPtYHfGtvYGm8ulXC6lnXec_A&maxResults=20`
            )
            .then((res) => {
                setBooks(res.data.items || []);
                console.log(res.data);
            })
            .catch((err) => console.error("Error fetching data:", err));
    };

    const saveBook = async (book) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const username = decodedToken.username;
                const bookData = {
                    isbn: book.volumeInfo?.industryIdentifiers?.[0]?.identifier || "Unknown",
                    title: book.volumeInfo?.title || "Untitled",
                    authors: book.volumeInfo?.authors || ["Unknown"],
                    link: book.volumeInfo?.previewLink || "No link available",
                    pageCount: book.volumeInfo?.pageCount || 0,
                    image: book.volumeInfo?.imageLinks?.thumbnail || "default-image-url",
                };

                const response = await axios.post("http://localhost:3000/save-book", { username, book: bookData });
                if (response.data.success) {
                    alert("Book saved!");
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                console.error("Failed to save book:", error);
            }
        }
    };

    return (
        <div className="container">
            <div className="container">
                <h2 className="text-center mb-4">Find Your Book</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchBook();
                    }}
                >
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                                className="form-control"
                            >
                                <option value="title">Title</option>
                                <option value="author">Author</option>
                                <option value="isbn">ISBN</option>
                            </select>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={
                                searchType === "author"
                                    ? "Enter Author Name"
                                    : searchType === "isbn"
                                    ? "Enter ISBN"
                                    : "Enter Book Title"
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="input-group-append">
                            <button type="submit" className="btn btn-outline-secondary">
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="container mt-3">
                {books.length === 0 ? (
                    <p className="text-center">No results found.</p>
                ) : (
                    <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
                        {books.map((book) => {
                            const volumeInfo = book.volumeInfo || {}; // Default to empty object if undefined
                            return (
                                <div className="col mb-3" key={book.id}>
                                    <div className="card h-100">
                                        <img
                                            src={
                                                volumeInfo.imageLinks?.thumbnail ||
                                                "https://fakeimg.pl/128x128?text=No+Image"
                                            }
                                            className="card-img-top small-image"
                                            alt={`Thumbnail for ${volumeInfo.title || "Untitled"}`}
                                        />
                                        <div className="card-body d-flex flex-column">
                                            <h3 className="card-title">
                                                {volumeInfo.title || "Untitled"}
                                            </h3>
                                            <p className="card-text mb-1">
                                                <strong>Authors:</strong>{" "}
                                                {volumeInfo.authors
                                                    ? volumeInfo.authors.join(", ")
                                                    : "Unknown"}
                                            </p>
                                            <p className="card-text mb-1">
                                                <strong>ISBN:</strong>{" "}
                                                {volumeInfo.industryIdentifiers?.[0]?.identifier || "N/A"}
                                            </p>
                                            <button className="btn btn-success mt-auto" onClick={() => saveBook(book)}>
                                                Save
                                            </button>
                                            <a
                                                href={volumeInfo.previewLink || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary mt-auto"
                                            >
                                                View More
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Books;
