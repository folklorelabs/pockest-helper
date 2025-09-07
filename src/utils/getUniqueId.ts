export default function getUniqueId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 15);
}