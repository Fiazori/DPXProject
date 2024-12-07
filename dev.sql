CREATE DATABASE DPX_PROJECT;
USE DPX_PROJECT;

Drop Database DPX_PROJECT;
-- USERS
CREATE TABLE DPX_USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('customer', 'employee') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP_CODE
CREATE TABLE DPX_OTP_CODE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,        -- 验证邮箱
    otp_code VARCHAR(6) NOT NULL,       -- 验证码
    code_type ENUM('R', 'C', 'D') NOT NULL, -- 验证码类型：R 注册，C 改密码，D 删除账号
    expires_at TIMESTAMP NOT NULL       -- 验证码过期时间
);
-- Location_Side
CREATE TABLE dpx_location (
    locaid        INT AUTO_INCREMENT PRIMARY KEY,
    location_side VARCHAR(30) NOT NULL COMMENT 'The location side of the stateroom (e.g., Forward, Aft, Left, Right)'
);
-- Port
CREATE TABLE dpx_port (
    portid    INT AUTO_INCREMENT PRIMARY KEY,
    pname     VARCHAR(50) NOT NULL COMMENT 'The name of the port',
    pstate    VARCHAR(50) NOT NULL COMMENT 'The state of the port',
    pcountry  VARCHAR(50) NOT NULL COMMENT 'The country of the port',
    pcity     VARCHAR(50) NOT NULL COMMENT 'The city of the port',
    pstreet   VARCHAR(80) NOT NULL COMMENT 'The street of the port',
    pzipcode  VARCHAR(20) NOT NULL COMMENT 'The zipcode of the port',
    nearest   VARCHAR(80) NOT NULL COMMENT 'The nearest airport name',
    parking   INT NOT NULL COMMENT 'The parking spot of the port'
);
-- Stateroom
CREATE TABLE dpx_stateroom (
    sid      INT AUTO_INCREMENT PRIMARY KEY,
    type     VARCHAR(30) NOT NULL COMMENT 'The type of the stateroom',
    size     INT NOT NULL COMMENT 'The size of the stateroom',
    bed      INT NOT NULL COMMENT 'Number of beds in the stateroom',
    bathroom DECIMAL(3, 1) NOT NULL COMMENT 'Number of bathrooms in the stateroom',
    balcony  INT NOT NULL COMMENT 'Number of balconies in the stateroom'
);
-- Package
CREATE TABLE dpx_package (
    packid       INT AUTO_INCREMENT PRIMARY KEY,
    packtype     VARCHAR(100) NOT NULL COMMENT 'The type of the package',
    packcost     INT NOT NULL COMMENT 'The cost per night of the package',
    pricing_type VARCHAR(30) NOT NULL COMMENT 'Indicates if the price is per day or for entire trip',
    is_available CHAR(1) NOT NULL COMMENT 'Indicates if the package is currently available ("Y" for Yes, "N" for No)'
);
-- Trip
CREATE TABLE dpx_trip (
    tripid     INT AUTO_INCREMENT PRIMARY KEY,
    night      INT NOT NULL COMMENT 'The total number of nights',
    startdate  DATE NOT NULL COMMENT 'The start date of the trip',
    enddate    DATE NOT NULL COMMENT 'The end date of the trip',
    is_active  CHAR(1) NOT NULL COMMENT 'Indicates if the trip is currently active and bookable ("Y" for Yes, "N" for No)',
    start_port INT NOT NULL,
    end_port   INT NOT NULL,
    FOREIGN KEY (start_port) REFERENCES dpx_port(portid),
    FOREIGN KEY (end_port) REFERENCES dpx_port(portid)
);
-- Activity 
CREATE TABLE dpx_activity (
    actid         INT AUTO_INCREMENT PRIMARY KEY,
    actname       VARCHAR(50) NOT NULL COMMENT 'The name of the activity',
    unit          INT NOT NULL COMMENT 'The number of units',
    min_age_limit INT COMMENT 'Specifies the minimum age requirement for the activity, if any',
    max_age_limit INT COMMENT 'Specifies the maximum age requirement for the activity, if any'
);
-- Restaurant
CREATE TABLE dpx_restaurant (
    resid        INT AUTO_INCREMENT PRIMARY KEY,
    resname      VARCHAR(30) NOT NULL COMMENT 'The name of the restaurant',
    restype      VARCHAR(50) COMMENT 'The type of food served at the restaurant',
    resstarttime TIME NOT NULL COMMENT 'The start time of restaurant operations',
    resendtime   TIME NOT NULL COMMENT 'The end time of restaurant operations',
    resfloor     VARCHAR(2) NOT NULL COMMENT 'The floor on which the restaurant is located'
);
-- Group
CREATE TABLE dpx_group (
    groupid    INT AUTO_INCREMENT PRIMARY KEY COMMENT 'The ID number of the group',
    group_size INT NOT NULL COMMENT 'The size of the group',
    tripid     INT NOT NULL,
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid)
);
-- Trip_port
CREATE TABLE dpx_trip_port (
    tripportid      INT AUTO_INCREMENT PRIMARY KEY,
    sequence_number INT NOT NULL COMMENT 'Order of the port in the trip itinerary',
    arrivaltime     DATETIME NOT NULL COMMENT 'Arrival time at this port',
    departuretime   DATETIME NOT NULL COMMENT 'Departure time from this port',
    portid          INT NOT NULL,
    tripid          INT NOT NULL,
    FOREIGN KEY (portid) REFERENCES dpx_port(portid),
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid)
);
-- Passenger_info
CREATE TABLE dpx_passenger_info (
    passinfoid  INT AUTO_INCREMENT PRIMARY KEY,
    fname       VARCHAR(20) NOT NULL COMMENT 'The first name of the passenger',
    lname       VARCHAR(20) NOT NULL COMMENT 'The last name of the passenger',
    birthdate   DATE NOT NULL COMMENT 'The birth date of the passenger',
    street      VARCHAR(30) NOT NULL COMMENT 'The street address of the passenger',
    city        VARCHAR(30) NOT NULL COMMENT 'The city of the passenger',
    state       VARCHAR(30) NOT NULL COMMENT 'The state of the passenger',
    country     VARCHAR(30) NOT NULL COMMENT 'The country of the passenger',
    zipcode     VARCHAR(10) NOT NULL COMMENT 'The postal code of the passenger',
    gender      VARCHAR(10) NOT NULL COMMENT 'The gender of the passenger',
    nationality VARCHAR(30) NOT NULL COMMENT 'The nationality of the passenger',
    email       VARCHAR(30) NOT NULL COMMENT 'The email address of the passenger',
    phone       VARCHAR(15) NOT NULL COMMENT 'The phone number of the passenger'
);
-- Trip_activity
CREATE TABLE dpx_trip_activity (
    tripid INT NOT NULL,
    actid  INT NOT NULL,
    PRIMARY KEY (tripid, actid),
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid),
    FOREIGN KEY (actid) REFERENCES dpx_activity(actid)
);
-- Pass_room
CREATE TABLE dpx_pass_room (
    roomid           INT AUTO_INCREMENT PRIMARY KEY COMMENT 'The unique identifier for the room entry',
    roomnumber       INT NOT NULL COMMENT 'The unique room number for each stateroom',
    tripid           INT NOT NULL,
    sid              INT NOT NULL,
    locaid           INT NOT NULL,
    price            DECIMAL(10, 2),
    occupancy_status CHAR(1) NOT NULL COMMENT 'Indicates if the room is currently occupied ("Y" for Yes, "N" for No)',
    FOREIGN KEY (locaid) REFERENCES dpx_location(locaid),
    FOREIGN KEY (sid) REFERENCES dpx_stateroom(sid),
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid)
);
-- Trip_package
CREATE TABLE dpx_trip_package (
    trippackid INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique ID for each trip-package combination',
    packid     INT NOT NULL,
    tripid     INT NOT NULL,
    FOREIGN KEY (packid) REFERENCES dpx_package(packid),
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid)
);
-- Passenger
CREATE TABLE dpx_passenger (
    passengerid INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identifier for a specific passenger in a trip',
    groupid     INT NOT NULL,
    roomid      INT,
    passinfoid  INT NOT NULL,
    FOREIGN KEY (passinfoid) REFERENCES dpx_passenger_info(passinfoid),
    FOREIGN KEY (groupid) REFERENCES dpx_group(groupid),
    FOREIGN KEY (roomid) REFERENCES dpx_pass_room(roomid)
);
-- Invoice
CREATE TABLE dpx_invoice (
    inid        INT AUTO_INCREMENT PRIMARY KEY COMMENT 'The unique identifier for the invoice',
    totalamount DECIMAL(10, 2) NOT NULL COMMENT 'The total amount of the invoice',
    duedate     DATE NOT NULL COMMENT 'The due date for the invoice',
    tripid      INT NOT NULL,
    groupid     INT NOT NULL,
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid),
    FOREIGN KEY (groupid) REFERENCES dpx_group(groupid)
);
-- Payment
CREATE TABLE dpx_payment (
    paymentid INT AUTO_INCREMENT PRIMARY KEY COMMENT 'The ID number of the payment',
    paydate   DATE NOT NULL COMMENT 'The date of the payment',
    payamount DECIMAL(10, 2) NOT NULL COMMENT 'The amount of the payment',
    paymethod VARCHAR(20) NOT NULL COMMENT 'The method of the payment',
    paytype   VARCHAR(30) NOT NULL COMMENT 'Indicates whether the payment is a full payment or part of an installment',
    inid      INT,
    FOREIGN KEY (inid) REFERENCES dpx_invoice(inid)
);

-- Saved_Pass
CREATE TABLE dpx_saved_pass (
    savedid INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,                    -- 用户ID (关联dpx_users)
    passinfoid INT NOT NULL,                -- 乘客信息ID (关联dpx_passenger_info)
    FOREIGN KEY (userid) REFERENCES dpx_users(user_id),
    FOREIGN KEY (passinfoid) REFERENCES dpx_passenger_info(passinfoid)
);
-- Pass_package
CREATE TABLE dpx_pass_package (
    trippackid  INT NOT NULL,
    passengerid INT NOT NULL,
    PRIMARY KEY (trippackid, passengerid),
    FOREIGN KEY (trippackid) REFERENCES dpx_trip_package(trippackid)
);
-- Activity_floor
CREATE TABLE dpx_activity_floor (
    floor VARCHAR(2) NOT NULL COMMENT 'The floor of the activity',
    actid INT NOT NULL,
    PRIMARY KEY (actid, floor),
    FOREIGN KEY (actid) REFERENCES dpx_activity(actid)
);
-- Trip_Restaurant
CREATE TABLE dpx_trip_restaurant (
    tripid INT NOT NULL,
    resid  INT NOT NULL,
    PRIMARY KEY (tripid, resid),
    FOREIGN KEY (tripid) REFERENCES dpx_trip(tripid),
    FOREIGN KEY (resid) REFERENCES dpx_restaurant(resid)
);

-- 限制side只能是前后左右
ALTER TABLE DPX_LOCATION
ADD CONSTRAINT C_STATEROOM_LOCATION_SIDE
CHECK (LOCATION_SIDE IN ('Bow', 'Stern', 'Port Side', 'Starboard Side'));

-- 到达时间必须在出发时间前
ALTER TABLE DPX_TRIP_PORT
ADD CONSTRAINT C_ARRI_BEFORE_DEPART
CHECK (ARRIVALTIME < DEPARTURETIME);

-- package available只能是Y/N
ALTER TABLE dpx_package
ADD CONSTRAINT chk_package_is_available
CHECK (is_available IN ('Y', 'N'));

-- trip is_active只能是Y/N
ALTER TABLE dpx_trip
ADD CONSTRAINT chk_trip_is_active
CHECK (is_active IN ('Y', 'N'));
-- room occupancy_status只能是Y/N
ALTER TABLE dpx_pass_room
ADD CONSTRAINT chk_pass_room_occupancy_status
CHECK (occupancy_status IN ('Y', 'N'));

-- package pricing_TYPE只能是person/night, person/entire trip
ALTER TABLE DPX_PACKAGE
ADD CONSTRAINT chk_pricing_type
CHECK (pricing_TYPE IN ('person/night', 'person/entire trip'));
-- Stateroom 

INSERT INTO DPX_STATEROOM (type, size, bed, bathroom, balcony) VALUES
('The Haven Suite', 1000, 6, 3.0, 2),
('Club Balcony Suite', 800, 4, 2.0, 2),
('Family Large Balcony', 600, 4, 2.0, 1),
('Family Balcony', 400, 4, 1.5, 1),
('Oceanview Window', 300, 2, 1.0, 0),
('Inside Stateroom', 200, 2, 1.0, 0),
('Studio Stateroom', 150, 1, 1.0, 0);

-- Location
INSERT INTO DPX_LOCATION (location_side) VALUES
('Bow'),
('Stern'),
('Port Side'),
('Starboard Side');

-- Restaurant
INSERT INTO DPX_RESTAURANT (resNAME, resTYPE, resSTARTTIME, resENDTIME, resFLOOR) VALUES
('Common Buffett', 'Breakfast, Dinner, Lunch', '07:00:00', '21:00:00', 6),
('Italian Specialty', 'Dinner', '18:00:00', '22:00:00', 8),
('Mexican Specialty', 'Dinner', '18:00:00', '22:00:00', 7),
('La-carte Continental', 'Lunch and Dinner', '12:00:00', '20:00:00', 6),
('Tokyo Ramen Japanese', 'Lunch and Dinner', '12:00:00', '20:00:00', 5),
('Ming Wok Chinese', 'Lunch and Dinner', '12:00:00', '20:00:00', 5),
('Round Clock Café', 'Beverages and Light Food', '00:00:00', '23:59:59', 10),
('Pool Bar', 'Alcoholic Beverages', '10:00:00', '22:00:00', 10),
('Stout Bar', 'Alcoholic Beverages', '10:00:00', '22:00:00', 7);

-- Activity
INSERT INTO DPX_ACTIVITY (actNAME, UNIT) VALUES
('Theaters', 2),
('Casino', 1),
('Library', 2),
('Children play', 1),
('Gym', 1),
('Outdoor pool', 1),
('Indoor pool', 1),
('Whirlpool', 2),
('Steam room', 1),
('Sona room', 1),
('Yoga room', 1),
('Night Club', 2),
('Tennis court', 1);

-- Activity Floor 
INSERT INTO DPX_ACTIVITY_FLOOR (actID, FLOOR) VALUES
(1, '8'), (1, '10'),
(2, '7'),
(3, '3'), (3, '4'),
(4, '3'),
(5, '5'),
(6, '11'),
(7, '9'),
(8, '11'), (8, '9'),
(9, '9'),
(10, '9'),
(11, '5'),
(12, '8'), (12, '11'),
(13, '11');



-- Package 
INSERT INTO DPX_PACKAGE (packTYPE, packCOST, pricing_TYPE, is_available) VALUES
('Water and Non-Alcoholic', 40, 'person/night', 'Y'),
('Unlimited Bar (for adult age over 21)', 80, 'person/night', 'Y'),
('Internet 200 minutes, 100 GB', 150, 'person/entire trip', 'Y'),
('Unlimited internet', 250, 'person/entire trip', 'Y'),
('Specialty dining (Italian, La-carte, Mexican, Japanese, Chinese)', 60, 'person/night', 'Y');

-- Port
INSERT INTO dpx_port 
    (pNAME, pSTATE, pCOUNTRY, pCITY, pSTREET, pZIPCODE, NEAREST, PARKING) 
VALUES 
    ('Miami', 'Florida', 'USA', 'Miami', 'Main Street', '33132', 'Miami International Airport', 500),
    ('Los Angeles', 'California', 'USA', 'Los Angeles', 'Harbor Blvd', '90731', 'Los Angeles International Airport', 800),
    ('Vancouver', 'British Columbia', 'Canada', 'Vancouver', 'Waterfront Rd', 'V6C 3T4', 'Vancouver International Airport', 300),
    ('Cozumel', 'Quintana Roo', 'Mexico', 'Cozumel', 'Calle 1 Sur', '77600', 'Cozumel International Airport', 150),
    ('San Juan', 'San Juan', 'Puerto Rico', 'San Juan', 'Paseo Gilberto Concepción', '00901', 'Luis Muñoz Marín International Airport', 200),
    ('New York', 'New York', 'USA', 'New York', '12th Ave', '10014', 'John F. Kennedy International Airport', 600),
    ('Galveston', 'Texas', 'USA', 'Galveston', 'Pier 21', '77550', 'William P. Hobby Airport', 250),
    ('Seattle', 'Washington', 'USA', 'Seattle', 'Alaskan Way', '98121', 'Seattle-Tacoma International Airport', 400),
    ('Fort Lauderdale', 'Florida', 'USA', 'Fort Lauderdale', 'Eller Dr', '33316', 'Fort Lauderdale-Hollywood International Airport', 350),
    ('San Diego', 'California', 'USA', 'San Diego', 'Harbor Dr', '92101', 'San Diego International Airport', 450),
    ('Tampa', 'Florida', 'USA', 'Tampa', 'Channelside Dr', '33602', 'Tampa International Airport', 300),
    ('New Orleans', 'Louisiana', 'USA', 'New Orleans', 'Poydras St', '70130', 'Louis Armstrong New Orleans International Airport', 200),
    ('Boston', 'Massachusetts', 'USA', 'Boston', 'Black Falcon Ave', '02210', 'Logan International Airport', 500),
    ('Halifax', 'Nova Scotia', 'Canada', 'Halifax', 'Marginal Rd', 'B3H 4P8', 'Halifax Stanfield International Airport', 150),
    ('Nassau', 'New Providence', 'Bahamas', 'Nassau', 'Woodes Rodgers Walk', 'N-3745', 'Lynden Pindling International Airport', 100),
    ('Montego Bay', 'St. James', 'Jamaica', 'Montego Bay', 'Howard Cooke Blvd', 'JMCJS12', 'Sangster International Airport', 120),
    ('Bridgetown', 'St. Michael', 'Barbados', 'Bridgetown', 'Hincks St', 'BB11000', 'Grantley Adams International Airport', 140),
    ('George Town', 'Grand Cayman', 'Cayman Islands', 'George Town', 'Harbour Dr', 'KY1-1002', 'Owen Roberts International Airport', 80),
    ('Oranjestad', 'Aruba', 'Aruba', 'Oranjestad', 'L.G. Smith Blvd', 'AW00000', 'Queen Beatrix International Airport', 110),
    ('Philipsburg', 'Sint Maarten', 'Sint Maarten', 'Philipsburg', 'Great Bay', 'SXM0001', 'Princess Juliana International Airport', 90),
    ('San Francisco', 'California', 'USA', 'San Francisco', 'Embarcadero', '94111', 'San Francisco International Airport', 500),
    ('Baltimore', 'Maryland', 'USA', 'Baltimore', 'Newgate Ave', '21224', 'Baltimore/Washington International Airport', 250),
    ('Charleston', 'South Carolina', 'USA', 'Charleston', 'Union Pier', '29401', 'Charleston International Airport', 300),
    ('Mobile', 'Alabama', 'USA', 'Mobile', 'Water St', '36602', 'Mobile Regional Airport', 100),
    ('Southampton', 'Hampshire', 'United Kingdom', 'Southampton', 'Herbert Walker Ave', 'SO15 1HJ', 'Southampton Airport', 400),
    ('Barcelona', 'Catalonia', 'Spain', 'Barcelona', 'Moll Adossat', '08039', 'Barcelona-El Prat Airport', 500),
    ('Rotterdam', 'South Holland', 'Netherlands', 'Rotterdam', 'Wilhelminakade', '3072 AP', 'Rotterdam The Hague Airport', 350),
    ('Rome', 'Lazio', 'Italy', 'Civitavecchia', 'Calata Laurenti', '00053', 'Leonardo da Vinci International Airport', 200),
    ('Piraeus', 'Attica', 'Greece', 'Piraeus', 'Akti Miaouli', '18538', 'Athens International Airport', 220),
    ('Sydney', 'New South Wales', 'Australia', 'Sydney', 'Overseas Passenger Terminal', '2000', 'Sydney Kingsford Smith Airport', 600),
    ('Auckland', 'Auckland', 'New Zealand', 'Auckland', 'Quay St', '1010', 'Auckland Airport', 400),
    ('Hong Kong', 'Central and Western', 'Hong Kong', 'Hong Kong', 'Harbour Rd', 'HK0001', 'Hong Kong International Airport', 450),
    ('Singapore', 'Central Region', 'Singapore', 'Singapore', 'Marina Coastal Dr', '018940', 'Changi Airport', 300),
    ('Yokohama', 'Kanagawa', 'Japan', 'Yokohama', 'Osanbashi Pier', '231-0002', 'Tokyo International Airport (Haneda)', 280),
    ('Buenos Aires', 'Buenos Aires', 'Argentina', 'Buenos Aires', 'Av. Ramón Castillo', 'C1104ACB', 'Ministro Pistarini International Airport', 150);



-- Trip
INSERT INTO DPX_TRIP (night, startdate, enddate, is_active, start_port, end_port) VALUES
(7, '2025-01-01', '2025-01-08', 'Y', 1, 6),
(10, '2025-02-01', '2025-02-11', 'Y', 5, 2);

-- Trip Port
INSERT INTO DPX_TRIP_PORT (sequence_number, arrivaltime, departuretime, portid, tripid) VALUES
(1, '2025-01-01 08:00:00', '2025-01-01 17:00:00', 1, 1),
(2, '2025-01-02 09:00:00', '2025-01-02 18:00:00', 9, 1),
(3, '2025-01-04 09:00:00', '2025-01-04 20:00:00', 22, 1),
(4, '2025-01-05 07:00:00', '2025-01-05 17:00:00', 23, 1),
(5, '2025-01-07 08:00:00', '2025-01-07 22:00:00', 6, 1),
(1, '2025-02-01 08:00:00', '2025-02-01 18:00:00', 11, 2),
(2, '2025-02-03 07:00:00', '2025-02-03 17:00:00', 7, 2),
(3, '2025-02-05 09:00:00', '2025-02-05 19:00:00', 10, 2),
(4, '2025-02-07 10:00:00', '2025-02-07 20:00:00', 21, 2),
(5, '2025-02-10 08:00:00', '2025-02-10 18:00:00', 26, 2);


-- Trip Activity
INSERT INTO DPX_TRIP_ACTIVITY (tripid, actID) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
(2, 11), (2, 12), (2, 13);

-- Trip Package
INSERT INTO DPX_TRIP_PACKAGE (packid, tripid) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(1, 2), (2, 2), (3, 2), (4, 2), (5, 2);

-- Passenger_info
INSERT INTO dpx_passenger_info 
(fname, lname, birthdate, street, city, state, country, zipcode, gender, nationality, email, phone) VALUES
('John', 'Doe', '1982-01-15', '123 Oak Lane', 'Springfield', 'IL', 'USA', '62701', 'Male', 'American', 'john.doe@email.com', '555-1234'),
('Jane', 'Smith', '1993-03-22', '234 Elm St', 'Fairfield', 'CA', 'USA', '94533', 'Female', 'American', 'jane.smith@email.com', '555-2345'),
('Alice', 'Johnson', '1985-07-18', '345 Maple Ave', 'Austin', 'TX', 'USA', '73301', 'Female', 'American', 'alice.johnson@email.com', '555-3456'),
('Mohamed', 'Al Fayed', '1990-11-12', '456 Cedar Blvd', 'Dubai', 'Dubai', 'UAE', '00000', 'Male', 'Emirati', 'mohamed.af@email.com', '555-4567'),
('Lucas', 'Martinez', '1984-05-30', '567 Pine St', 'Buenos Aires', 'Buenos Aires', 'Argentina', 'C1007', 'Male', 'Argentinian', 'lucas.m@email.com', '555-5678'),
('Li', 'Wang', '1991-09-16', '678 Spruce Rd', 'Shanghai', 'Shanghai', 'China', '200000', 'Male', 'Chinese', 'li.wang@email.com', '555-6789'),
('Chloe', 'Dubois', '1979-12-23', '789 Birch St', 'Paris', 'Paris', 'France', '75016', 'Female', 'French', 'chloe.d@email.com', '555-7890'),
('Sofia', 'Silva', '1996-02-14', '890 Oak St', 'Lisbon', 'Lisbon', 'Portugal', '1100-220', 'Female', 'Portuguese', 'sofia.s@email.com', '555-8901'),
('Hans', 'Müller', '1972-04-03', '12 Cherry Lane', 'Berlin', 'Berlin', 'Germany', '10115', 'Male', 'German', 'hans.m@email.com', '555-9012'),
('Anna', 'Petrova', '1988-06-19', '23 Lime St', 'Moscow', 'Moscow', 'Russia', '101000', 'Female', 'Russian', 'anna.p@email.com', '555-0123'),
('Yamato', 'Takahashi', '1975-08-25', '34 Peach Blvd', 'Tokyo', 'Tokyo', 'Japan', '160-0022', 'Male', 'Japanese', 'yamato.t@email.com', '555-0234'),
('Nadia', 'Khan', '1986-10-09', '45 Plum Rd', 'Karachi', 'Sindh', 'Pakistan', '74600', 'Female', 'Pakistani', 'nadia.k@email.com', '555-0345'),
('Samuel', 'Adams', '1992-03-11', '56 Nutmeg Ave', 'New York', 'NY', 'USA', '10001', 'Male', 'American', 'samuel.a@email.com', '555-0456'),
('Maria', 'Garcia', '1999-07-27', '67 Apple St', 'Madrid', 'Madrid', 'Spain', '28001', 'Female', 'Spanish', 'maria.g@email.com', '555-0567'),
('David', 'Reilly', '1974-09-15', '78 Fig Dr', 'Dublin', 'Dublin', 'Ireland', 'D01', 'Male', 'Irish', 'david.or@email.com', '555-0678'),
('Fatima', 'Hassan', '1990-12-01', '89 Grape St', 'Cairo', 'Cairo', 'Egypt', '11511', 'Female', 'Egyptian', 'fatima.h@email.com', '555-0789'),
('Carlos', 'Diaz', '1983-02-18', '90 Lemon Ln', 'Mexico City', 'Mexico City', 'Mexico', '01000', 'Male', 'Mexican', 'carlos.d@email.com', '555-0890'),
('Rachel', 'Goldberg', '1995-05-22', '101 Kiwi Rd', 'Tel Aviv', 'Tel Aviv', 'Israel', '61000', 'Female', 'Israeli', 'rachel.g@email.com', '555-0901'),
('Kumar', 'Singh', '1987-11-30', '102 Mango Blvd', 'New Delhi', 'Delhi', 'India', '110001', 'Male', 'Indian', 'kumar.s@email.com', '555-1012'),
('Isabella', 'Rossi', '1994-01-16', '103 Coconut St', 'Rome', 'Rome', 'Italy', '00100', 'Female', 'Italian', 'isabella.r@email.com', '555-1123'),
('Benjamin', 'Lee', '1980-07-20', '104 Fig Rd', 'Vancouver', 'BC', 'Canada', 'V5K 0A1', 'Male', 'Canadian', 'benjamin.l@email.com', '555-1235'),
('Olivia', 'Brown', '1989-09-04', '105 Peach Dr', 'Wellington', 'Wellington', 'New Zealand', '6011', 'Female', 'New Zealander', 'olivia.b@email.com', '555-1346'),
('Max', 'Schneider', '1978-03-03', '106 Date Ln', 'Zurich', 'Zurich', 'Switzerland', '8001', 'Male', 'Swiss', 'max.s@email.com', '555-1457'),
('Elena', 'Vasquez', '1992-12-17', '107 Banana Ave', 'Santiago', 'Santiago', 'Chile', '8320000', 'Female', 'Chilean', 'elena.v@email.com', '555-1568'),
('Peter', 'Nguyen', '1985-05-29', '108 Plum Blvd', 'Ho Chi Minh City', 'Ho Chi Minh', 'Vietnam', '700000', 'Male', 'Vietnamese', 'peter.n@email.com', '555-1679'),
('Sarah', 'Taylor', '1993-08-13', '109 Nectarine St', 'Sydney', 'NSW', 'Australia', '2000', 'Female', 'Australian', 'sarah.t@email.com', '555-1780'),
('Alex', 'Young', '1996-11-21', '110 Pear Rd', 'Cape Town', 'Western Cape', 'South Africa', '7100', 'Male', 'South African', 'alex.y@email.com', '555-1891'),
('Sophia', 'Kim', '1991-02-14', '111 Lychee Ln', 'Seoul', 'Seoul', 'South Korea', '03063', 'Female', 'Korean', 'sophia.k@email.com', '555-1902'),
('Ibrahim', 'Mohamed', '1984-06-30', '112 Guava St', 'Nairobi', 'Nairobi', 'Kenya', '00100', 'Male', 'Kenyan', 'ibrahim.m@email.com', '555-2013'),
('Eva', 'Müller', '1987-01-08', '113 Melon Dr', 'Munich', 'Bavaria', 'Germany', '80331', 'Female', 'German', 'eva.m@email.com', '555-2124');
INSERT INTO dpx_passenger_info 
(fname, lname, birthdate, street, city, state, country, zipcode, gender, nationality, email, phone) VALUES
('Oliver', 'Grant', '1991-03-21', '501 Sunset Blvd', 'Los Angeles', 'CA', 'USA', '90026', 'Male', 'American', 'oliver.grant@email.com', '555-3101'),
('Emma', 'Hayes', '1988-05-16', '502 Bright St', 'Toronto', 'ON', 'Canada', 'M5G 2L3', 'Female', 'Canadian', 'emma.hayes@email.com', '555-3202'),
('Noah', 'Ford', '1993-07-11', '503 Maple Dr', 'Vancouver', 'BC', 'Canada', 'V5K 0A1', 'Male', 'Canadian', 'noah.ford@email.com', '555-3303'),
('Sophia', 'Lopez', '1990-12-30', '504 Pine Rd', 'Mexico City', 'DF', 'Mexico', '03100', 'Female', 'Mexican', 'sophia.lopez@email.com', '555-3404'),
('Liam', 'Smith', '1982-11-25', '505 Oak Lane', 'Dublin', 'Dublin', 'Ireland', 'D02 HX65', 'Male', 'Irish', 'liam.smith@email.com', '555-3505'),
('Isabella', 'Brown', '1986-09-05', '506 Cherry Cir', 'Madrid', 'Madrid', 'Spain', '28080', 'Female', 'Spanish', 'isabella.brown@email.com', '555-3606'),
('Ethan', 'Davis', '1989-01-14', '507 Elm St', 'Paris', 'Île-de-France', 'France', '75001', 'Male', 'French', 'ethan.davis@email.com', '555-3707'),
('Mia', 'Wilson', '1994-02-19', '508 Cedar Pl', 'Rome', 'Rome', 'Italy', '00100', 'Female', 'Italian', 'mia.wilson@email.com', '555-3808'),
('James', 'Johnson', '1985-08-08', '509 Birch Rd', 'Berlin', 'Berlin', 'Germany', '10115', 'Male', 'German', 'james.johnson@email.com', '555-3909'),
('Amelia', 'Miller', '1997-12-23', '510 Walnut St', 'Amsterdam', 'North Holland', 'Netherlands', '1011 VX', 'Female', 'Dutch', 'amelia.miller@email.com', '555-4010'),
('Lucas', 'Anderson', '1984-10-15', '511 Spruce Way', 'Stockholm', 'Stockholm', 'Sweden', '111 52', 'Male', 'Swedish', 'lucas.anderson@email.com', '555-4111'),
('Charlotte', 'Martinez', '1992-04-17', '512 Redwood Blvd', 'Lisbon', 'Lisbon', 'Portugal', '1100-388', 'Female', 'Portuguese', 'charlotte.martinez@email.com', '555-4212'),
('Logan', 'Taylor', '1987-06-19', '513 Aspen Dr', 'Brussels', 'Brussels', 'Belgium', '1000', 'Male', 'Belgian', 'logan.taylor@email.com', '555-4313'),
('Evelyn', 'Moore', '1995-07-30', '514 Fir Ln', 'Zurich', 'Zurich', 'Switzerland', '8001', 'Female', 'Swiss', 'evelyn.moore@email.com', '555-4414'),
('Aiden', 'Jackson', '1993-03-22', '515 Palm Rd', 'Copenhagen', 'Copenhagen', 'Denmark', '2100', 'Male', 'Danish', 'aiden.jackson@email.com', '555-4515'),
('Harper', 'Lee', '1986-01-15', '516 Magnolia Ave', 'Oslo', 'Oslo', 'Norway', '0106', 'Female', 'Norwegian', 'harper.lee@email.com', '555-4616'),
('Jackson', 'Harris', '1990-11-09', '517 Pinecrest Path', 'Helsinki', 'Uusimaa', 'Finland', '00100', 'Male', 'Finnish', 'jackson.harris@email.com', '555-4717'),
('Lily', 'Clark', '1988-09-16', '518 Redwood St', 'Vienna', 'Vienna', 'Austria', '1010', 'Female', 'Austrian', 'lily.clark@email.com', '555-4818'),
('Benjamin', 'Rodriguez', '1994-05-21', '519 Spruce Ct', 'Prague', 'Prague', 'Czech Republic', '110 00', 'Male', 'Czech', 'benjamin.rodriguez@email.com', '555-4919'),
('Zoe', 'Thomas', '1991-08-08', '520 Maple Lane', 'Budapest', 'Budapest', 'Hungary', '1011', 'Female', 'Hungarian', 'zoe.thomas@email.com', '555-5020');

-- GROUP
INSERT INTO DPX_GROUP (group_size, tripid) VALUES
(5, 1), (6, 1), (4, 1), (7, 1), (3, 1), (5, 1);

-- Passenger_room
INSERT INTO DPX_PASS_ROOM (roomnumber, tripid, sid, locaid, price, occupancy_status) VALUES
(101, 1, 1, 1, 1000.00, 'N'), (102, 1, 1, 2, 950.00, 'N'),
(103, 1, 1, 3, 900.00, 'Y'), (104, 1, 1, 4, 850.00, 'Y'),
(105, 1, 2, 1, 800.00, 'Y'), (106, 1, 2, 2, 760.00, 'N'),
(107, 1, 2, 3, 720.00, 'Y'), (108, 1, 2, 4, 680.00, 'Y');

-- Passenger
INSERT INTO DPX_PASSENGER (groupid, roomid, passinfoid) VALUES
(1, 1, 1), (1, 1, 2), (1, 1, 3), (1, 1, 4), (1, 1, 5),
(2, 2, 6), (2, 2, 7), (2, 2, 8), (2, 2, 9), (2, 2, 10),
(3, 6, 12), (3, 6, 13), (3, 6, 14), (3, 6, 15);


-- SAVED_PASS
INSERT INTO DPX_SAVED_PASS (userid, passinfoid) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);

-- 增加新column group id
ALTER TABLE DPX_PASS_ROOM
ADD COLUMN groupid INT AFTER tripid;

select * from DPX_group
select * from DPX_Passenger
select * from DPX_Pass_room
select *from DPX_saved_pass
select * from dpx_passenger_info

select *from DPX_pass_room

            SELECT p.passengerid, pi.fname, pi.lname, pi.email
            FROM dpx_passenger p
            JOIN dpx_passenger_info pi ON p.passinfoid = pi.passinfoid
            WHERE p.groupid = 9
