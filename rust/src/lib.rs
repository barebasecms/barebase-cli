//! BareBase - everything your backend needs, nothing it does not.
//!
//! This crate reserves the `barebase` name for the official BareBase project,
//! a zero-dependency headless CMS with a Directus-compatible API, built-in MCP
//! server, first-class realtime, and native ClickHouse mounts.
//!
//! The engine ships as a single binary, not a Rust library. Install:
//!
//! - npm: `npm install -g barebasecms`
//! - pip: `pip install barebase`
//! - docker: `docker run barebase/barebase`
//!
//! Site: <https://barebase.io>

/// Product homepage.
pub const HOMEPAGE: &str = "https://barebase.io";

#[cfg(test)]
mod tests {
    #[test]
    fn homepage_is_barebase_io() {
        assert_eq!(super::HOMEPAGE, "https://barebase.io");
    }
}
